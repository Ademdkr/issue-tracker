# 🚀 Deployment-Anleitung: Issue Tracker auf Render

**Ziel**: Deployment auf `issue-tracker.ademdokur.dev` mit automatischem CI/CD bei Push/Merge auf `master`.

---

## 📋 Übersicht

Diese Anleitung beschreibt das vollständige Deployment des Issue Trackers auf Render mit:

- PostgreSQL Datenbank
- NestJS Backend API
- Angular Frontend (Nginx)
- Custom Domain: `issue-tracker.ademdokur.dev`
- Automatisches Deployment bei Push auf `master`

---

## ⚙️ Voraussetzungen

- [x] Render Account erstellt
- [x] GitHub Repository verbunden
- [x] Domain `ademdokur.dev` vorhanden
- [x] Projekt lokal funktionsfähig

---

## Phase 1: Vorbereitung & Konfiguration

### 1.1 Render Blueprint erstellen

**Datei**: `render.yaml` (im Projekt-Root)

```yaml
services:
  # PostgreSQL Database
  - type: pserv
    name: issue-tracker-db
    env: production
    plan: free # oder starter/standard
    region: frankfurt # oder oregon
    databaseName: issue_tracker_db
    databaseUser: postgres
    ipAllowList: [] # Leer = alle Render Services

  # Backend API (NestJS)
  - type: web
    name: issue-tracker-backend
    env: production
    plan: free # oder starter/standard
    region: frankfurt
    buildCommand: npm ci && npx prisma generate --schema=./apps/backend/prisma/schema.prisma && npx nx build backend --configuration=production
    startCommand: npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma && node dist/apps/backend/main.js
    dockerfilePath: ./apps/backend/Dockerfile
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: issue-tracker-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 15m
      - key: JWT_REFRESH_EXPIRES_IN
        value: 7d
      - key: FRONTEND_URL
        value: https://issue-tracker.ademdokur.dev
      - key: CORS_ORIGINS
        value: https://issue-tracker.ademdokur.dev

  # Frontend (Angular + Nginx)
  - type: web
    name: issue-tracker-frontend
    env: production
    plan: free
    region: frankfurt
    dockerfilePath: ./apps/frontend/Dockerfile
    buildCommand: npm ci && npx nx build frontend --configuration=production
    envVars:
      - key: API_URL
        fromService:
          name: issue-tracker-backend
          type: web
          property: host
```

**Status**: ✅ Blueprint erstellt

---

### 1.2 Umgebungsvariablen vorbereiten

Erstelle eine Liste aller Secrets, die in Render konfiguriert werden müssen:

#### Backend Environment Variables

| Variable                 | Beschreibung                     | Beispielwert                              |
| ------------------------ | -------------------------------- | ----------------------------------------- |
| `NODE_ENV`               | Node Umgebung                    | `production`                              |
| `PORT`                   | Backend Port                     | `3000`                                    |
| `DATABASE_URL`           | PostgreSQL Connection String     | Von Render bereitgestellt                 |
| `JWT_SECRET`             | JWT Signierung (min. 32 Zeichen) | Generieren mit: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET`     | Refresh Token Secret             | Generieren mit: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN`         | Access Token Lifetime            | `15m`                                     |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token Lifetime           | `7d`                                      |
| `FRONTEND_URL`           | Frontend URL für CORS            | `https://issue-tracker.ademdokur.dev`     |
| `CORS_ORIGINS`           | Erlaubte CORS Origins            | `https://issue-tracker.ademdokur.dev`     |
| `THROTTLE_TTL`           | Rate Limit Zeitfenster           | `60000`                                   |
| `THROTTLE_LIMIT`         | Rate Limit Max Requests          | `100`                                     |

#### Frontend Environment Variables

| Variable  | Beschreibung         | Beispielwert           |
| --------- | -------------------- | ---------------------- |
| `API_URL` | Backend API Base URL | Automatisch von Render |

**JWT Secrets generieren**:

```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET
openssl rand -base64 32
```

**Status**: ✅ Secrets vorbereitet

---

### 1.3 Dockerfiles validieren

Überprüfe, ob die Dockerfiles production-ready sind:

**Backend Dockerfile** (`apps/backend/Dockerfile`):

- [x] Multi-stage build
- [x] Non-root user
- [x] Prisma Client Generation
- [x] Security updates
- [x] Health check

**Frontend Dockerfile** (`apps/frontend/Dockerfile`):

- [x] Multi-stage build
- [x] Nginx configuration
- [x] Production build
- [x] Security updates
- [x] Gzip compression

**Status**: ✅ Dockerfiles bereit

---

## Phase 2: Render Setup

### 2.1 PostgreSQL Datenbank erstellen

1. Gehe zu [Render Dashboard](https://dashboard.render.com)
2. Klicke auf **"New +"** → **"PostgreSQL"**
3. Konfiguration:
   - **Name**: `issue-tracker-db`
   - **Database**: `issue_tracker_db`
   - **User**: `postgres`
   - **Region**: `Frankfurt` (EU) oder `Oregon` (US)
   - **Plan**: `Free` (oder `Starter` für Backups)
4. Klicke **"Create Database"**
5. Warte bis Status `Available` ist
6. Notiere die **Internal Connection String**

**Status**: ⏳ Datenbank wird erstellt

---

### 2.2 Backend Service erstellen

1. Gehe zu **"New +"** → **"Web Service"**
2. Verbinde GitHub Repository: `Ademdkr/issue-tracker`
3. Konfiguration:

   **Basic Settings**:

   - **Name**: `issue-tracker-backend`
   - **Region**: `Frankfurt` (gleiche wie DB)
   - **Branch**: `master`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `apps/backend/Dockerfile`

   **Build & Deploy**:

   - **Build Command**:
     ```bash
     npm ci && npx prisma generate --schema=./apps/backend/prisma/schema.prisma && npx nx build backend --configuration=production
     ```
   - **Start Command**:
     ```bash
     npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma && node dist/apps/backend/main.js
     ```

   **Advanced Settings**:

   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`

4. Environment Variables hinzufügen (siehe Abschnitt 1.2)
5. Für `DATABASE_URL`: Wähle **"Add from Database"** → `issue-tracker-db` → `Internal Connection String`
6. Klicke **"Create Web Service"**

**Status**: ⏳ Backend wird deployed

---

### 2.3 Frontend Service erstellen

1. Gehe zu **"New +"** → **"Web Service"**
2. Verbinde GitHub Repository: `Ademdkr/issue-tracker`
3. Konfiguration:

   **Basic Settings**:

   - **Name**: `issue-tracker-frontend`
   - **Region**: `Frankfurt`
   - **Branch**: `master`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `apps/frontend/Dockerfile`

   **Build & Deploy**:

   - **Build Command**:
     ```bash
     npm ci && npx nx build frontend --configuration=production
     ```
   - **Start Command**: (automatisch von Nginx Docker Image)

   **Advanced Settings**:

   - **Auto-Deploy**: `Yes`

4. Environment Variables:

   - `BACKEND_URL`: Backend Service URL (intern)

5. Klicke **"Create Web Service"**

**Status**: ⏳ Frontend wird deployed

---

## Phase 3: Domain-Konfiguration

### 3.1 DNS-Einträge bei Domain-Provider setzen

Bei deinem DNS-Provider (z.B. Namecheap, GoDaddy, Cloudflare):

1. Gehe zu DNS-Einstellungen für `ademdokur.dev`
2. Füge folgende Records hinzu:

   **Für Frontend**:

   ```
   Type: CNAME
   Name: issue-tracker
   Value: <render-frontend-url>.onrender.com
   TTL: 3600
   ```

   **Für Backend API** (optional, wenn separate Domain gewünscht):

   ```
   Type: CNAME
   Name: api.issue-tracker
   Value: <render-backend-url>.onrender.com
   TTL: 3600
   ```

3. Speichern und auf DNS-Propagierung warten (bis zu 48h, meist < 1h)

**Render URL finden**:

- Im Render Dashboard → Service → Settings → "Your service is live at..."

**Status**: ⏳ DNS wird propagiert

---

### 3.2 Custom Domain in Render hinzufügen

#### Frontend Domain konfigurieren

1. Gehe zu Render Dashboard → `issue-tracker-frontend` Service
2. Klicke auf **"Settings"** → **"Custom Domains"**
3. Klicke **"Add Custom Domain"**
4. Gebe ein: `issue-tracker.ademdokur.dev`
5. Klicke **"Save"**
6. Warte auf SSL-Zertifikat (automatisch via Let's Encrypt)
7. Status sollte `Active` mit grünem Haken sein

#### Backend Domain konfigurieren (optional)

1. Gehe zu `issue-tracker-backend` Service
2. Wiederhole Schritte für: `api.issue-tracker.ademdokur.dev`

**Alternative**: Backend über Frontend Nginx Proxy erreichbar machen:

- Frontend leitet `/api/*` an Backend weiter
- Nur eine Domain erforderlich

**Status**: ⏳ SSL-Zertifikate werden generiert

---

## Phase 4: CI/CD Pipeline

### 4.1 Render Auto-Deploy aktivieren

Auto-Deploy ist bereits in Phase 2 aktiviert worden. Verifiziere:

1. Gehe zu Service → **"Settings"** → **"Build & Deploy"**
2. Prüfe:
   - ✅ **Auto-Deploy**: `Yes`
   - ✅ **Branch**: `master`
   - ✅ **Deploy on push**: Aktiviert

Bei jedem Push/Merge auf `master` wird automatisch deployed.

**Status**: ✅ Auto-Deploy aktiviert

---

### 4.2 GitHub Actions Workflow aktivieren (Optional)

Falls zusätzliche CI-Checks vor Deployment gewünscht:

**Datei**: `.github/workflows/deploy-production.yml`

Entferne Kommentare:

```yaml
on:
  push:
    branches:
      - master
```

Füge Render Deploy Hook hinzu:

```yaml
- name: Trigger Render Deploy
  run: |
    curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_BACKEND }}
    curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}
```

**Deploy Hooks erstellen**:

1. Render Dashboard → Service → Settings → Deploy Hook
2. Kopiere URL
3. GitHub → Settings → Secrets → New secret
   - Name: `RENDER_DEPLOY_HOOK_BACKEND`
   - Value: (URL)

**Status**: ⏳ Optional - GitHub Actions

---

## Phase 5: Deployment & Testing

### 5.1 Initiales Deployment überwachen

1. Gehe zu Render Dashboard → Services
2. Beobachte Logs:
   - **Backend**: Build → Prisma Migrate → Start
   - **Frontend**: Build → Nginx Start
3. Prüfe Health Checks:
   - Backend: Sollte `/api/health` erfolgreich antworten
   - Frontend: Sollte online sein

**Fehler beheben**:

- Bei Build-Fehlern: Logs in Render Dashboard prüfen
- Bei Migrations-Fehlern: `DATABASE_URL` prüfen

**Status**: ⏳ Deployment läuft

---

### 5.2 Datenbank mit Seed-Daten befüllen

Nach erfolgreichem Backend-Deployment:

1. Render Dashboard → `issue-tracker-backend` → **"Shell"**
2. Führe Seed-Skript aus:
   ```bash
   cd /app
   npx prisma db seed
   ```
3. Oder alternative: Seed-Daten importieren:
   ```bash
   node apps/backend/prisma/import-seed-data.js
   ```

**Test-Benutzer**:
Nach dem Seeding sind folgende Test-Accounts verfügbar (siehe `seed.ts`):

- Admin: `admin@example.com`
- Developer: `developer@example.com`
- Reporter: `reporter@example.com`

**Status**: ⏳ Datenbank wird befüllt

---

### 5.3 End-to-End Tests durchführen

#### Frontend testen

1. Öffne: `https://issue-tracker.ademdokur.dev`
2. Prüfe:
   - ✅ Seite lädt korrekt
   - ✅ Login-Seite wird angezeigt
   - ✅ Keine Console-Fehler

#### Backend API testen

1. Health Check:

   ```bash
   curl https://issue-tracker.ademdokur.dev/api/health
   ```

   Erwartete Antwort:

   ```json
   {
     "status": "ok",
     "info": { "database": { "status": "up" } },
     "details": { "database": { "status": "up" } }
   }
   ```

2. Swagger Dokumentation:
   - Öffne: `https://issue-tracker.ademdokur.dev/api/docs`
   - Sollte Swagger UI zeigen

#### Login-Flow testen

1. Gehe zu: `https://issue-tracker.ademdokur.dev`
2. Login mit Test-Account:
   - Email: `admin@example.com`
   - Password: (aus Seed-Skript)
3. Prüfe:
   - ✅ Dashboard lädt
   - ✅ Projekte werden angezeigt
   - ✅ Navigation funktioniert

**Status**: ✅ Tests erfolgreich

---

## Phase 6: Monitoring & Optimierung

### 6.1 Monitoring einrichten

**Render Metrics**:

1. Dashboard → Service → **"Metrics"**
2. Überwache:
   - CPU Usage
   - Memory Usage
   - Request Rate
   - Response Time

**Log Aggregation**:

1. Dashboard → Service → **"Logs"**
2. Filter nach Fehler-Level
3. Richte Alerts ein (Render Paid Plans)

**Status**: ✅ Monitoring aktiv

---

### 6.2 Backup-Strategie

**Automatische Datenbank-Backups**:

- Render Free Plan: Keine automatischen Backups
- Render Starter Plan: Daily Backups (7 Tage)
- Render Standard Plan: Daily + Point-in-Time Recovery

**Manuelles Backup**:

```bash
# Lokal per pg_dump
pg_dump -h <render-db-host> -U postgres -d issue_tracker_db > backup.sql
```

**Backup in Render Shell**:

1. Dashboard → Database → Shell
2. Führe aus:
   ```bash
   pg_dump issue_tracker_db > /tmp/backup.sql
   ```

**Status**: ✅ Backup-Strategie definiert

---

### 6.3 Performance-Optimierung

**Frontend**:

- ✅ Nginx Gzip Compression aktiviert
- ✅ Static Asset Caching (nginx.conf)
- ✅ Production Build mit AOT

**Backend**:

- ✅ Response Compression (Helmet)
- ✅ Rate Limiting aktiv
- ✅ Database Connection Pooling (Prisma)

**Weitere Optimierungen**:

- [ ] CDN für statische Assets (z.B. Cloudflare)
- [ ] Redis für Session-Caching (Render Add-on)
- [ ] Database Indexing optimieren

**Status**: ✅ Basis-Optimierungen aktiv

---

## Phase 7: Absicherung & Finalisierung

### 7.1 Security Hardening

**HTTPS erzwingen**:

- ✅ Render aktiviert automatisch HTTPS
- ✅ HTTP → HTTPS Redirect aktiv

**Security Headers** (in `main.ts` Backend):

```typescript
app.use(
  helmet({
    contentSecurityPolicy: false, // für Swagger UI
    crossOriginEmbedderPolicy: false,
  })
);
```

**CORS richtig konfigurieren**:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'https://issue-tracker.ademdokur.dev',
  ],
  credentials: true,
});
```

**Rate Limiting** (bereits implementiert):

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100
    }])
  ]
})
```

**Status**: ✅ Security Headers aktiv

---

### 7.2 Environment Variables Production Check

Überprüfe in Render Dashboard, dass folgende Werte NICHT die Defaults sind:

- ❌ `JWT_SECRET` darf NICHT: `your-super-secret-jwt-key...`
- ❌ `JWT_REFRESH_SECRET` darf NICHT: `your-super-secret-refresh-key...`
- ❌ `POSTGRES_PASSWORD` darf NICHT: `your-secure-postgres-password...`

**Aktion bei Default-Werten**:

1. Generiere neue Secrets (siehe 1.2)
2. Update in Render Dashboard
3. Redeploy Service

**Status**: ✅ Secrets validiert

---

### 7.3 Final Production Checklist

#### Infrastructure

- [ ] PostgreSQL Datenbank läuft
- [ ] Backend Service deployed
- [ ] Frontend Service deployed
- [ ] Custom Domain aktiv mit SSL
- [ ] Auto-Deploy auf `master` aktiviert

#### Security

- [ ] JWT Secrets sind sicher generiert
- [ ] CORS auf Production Domain beschränkt
- [ ] HTTPS-only aktiv
- [ ] Rate Limiting funktioniert
- [ ] Security Headers aktiv (Helmet)

#### Functionality

- [ ] Login funktioniert
- [ ] Dashboard lädt Daten
- [ ] Projekte können erstellt werden
- [ ] Tickets können erstellt werden
- [ ] API Swagger Docs erreichbar
- [ ] Health Check antwortet

#### Monitoring

- [ ] Logs werden angezeigt
- [ ] Metrics werden erfasst
- [ ] Backup-Strategie implementiert

#### Performance

- [ ] Frontend lädt schnell (< 3s)
- [ ] API Response Time akzeptabel (< 500ms)
- [ ] Keine Memory Leaks

**Status**: ✅ Production Ready!

---

## 🎉 Deployment abgeschlossen!

### Wichtige URLs

| Ressource            | URL                                            |
| -------------------- | ---------------------------------------------- |
| **Frontend**         | https://issue-tracker.ademdokur.dev            |
| **API Base**         | https://issue-tracker.ademdokur.dev/api        |
| **Swagger Docs**     | https://issue-tracker.ademdokur.dev/api/docs   |
| **Health Check**     | https://issue-tracker.ademdokur.dev/api/health |
| **Render Dashboard** | https://dashboard.render.com                   |

---

## 🔧 Troubleshooting

### Backend startet nicht

**Symptom**: Backend Service zeigt "Deploy failed"

**Lösung**:

1. Prüfe Logs: Dashboard → Backend → Logs
2. Häufige Fehler:
   - `DATABASE_URL` fehlt oder falsch
   - Prisma Migration fehlgeschlagen
   - Port bereits in Verwendung

**Fix**:

```bash
# In Render Shell
npx prisma migrate reset --force
npx prisma migrate deploy
```

---

### Frontend zeigt 404 bei API-Calls

**Symptom**: API-Requests schlagen fehl

**Lösung**:

1. Prüfe `nginx.conf` Proxy-Konfiguration:
   ```nginx
   location /api {
     proxy_pass http://backend:3000;
   }
   ```
2. Prüfe Backend URL in Frontend Environment
3. Prüfe CORS-Konfiguration

---

### SSL-Zertifikat wird nicht generiert

**Symptom**: Custom Domain zeigt "SSL Pending"

**Lösung**:

1. DNS-Propagierung abwarten (bis 48h)
2. Prüfe DNS-Einträge:
   ```bash
   nslookup issue-tracker.ademdokur.dev
   ```
3. CNAME sollte auf Render URL zeigen
4. Erzwinge SSL-Refresh: Domain entfernen und neu hinzufügen

---

### Database Connection Failed

**Symptom**: Backend kann nicht auf DB zugreifen

**Lösung**:

1. Prüfe `DATABASE_URL` Format:
   ```
   postgresql://user:password@host:port/database
   ```
2. Verwende **Internal Connection String** (nicht External)
3. Prüfe DB-Status: Dashboard → Database → Status

---

## 📚 Weitere Ressourcen

- [Render Documentation](https://render.com/docs)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Render Docker Deployments](https://render.com/docs/docker)
- [NestJS Production Guide](https://docs.nestjs.com/techniques/performance)
- [Angular Deployment Guide](https://angular.io/guide/deployment)

---

**Dokumentversion**: 1.0  
**Letzte Aktualisierung**: 29. Dezember 2025  
**Autor**: Issue Tracker Team
