# ✅ Issue Tracker - Erfolgreiches Deployment auf Render

**Deployment URL**: https://issue-tracker.ademdokur.dev  
**Backend API**: https://issue-tracker-backend-23d7.onrender.com  
**Status**: 🟢 Live  
**Deployment-Datum**: 30. Dezember 2025

---

## 🎯 Deployment-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│  https://issue-tracker.ademdokur.dev (Frontend)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Angular SPA (Static Hosting - Render)              │   │
│  │  - Nginx 1.27 Alpine                                 │   │
│  │  - Direct Backend Connection (nicht Proxy!)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (Direct Connection)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  https://issue-tracker-backend-23d7.onrender.com (Backend)  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  NestJS API (Docker - Render Web Service)           │   │
│  │  - Node 20 Alpine                                    │   │
│  │  - Prisma Client (Runtime Generation)               │   │
│  │  - JWT Authentication                                │   │
│  │  - CORS: issue-tracker.ademdokur.dev                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Internal Database URL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database (Render PostgreSQL Service)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 16                                       │   │
│  │  - Database: issue_tracker_db_1u0p                   │   │
│  │  - User: issue_tracker_user                          │   │
│  │  - Region: Frankfurt                                 │   │
│  │  - Internal URL (schneller, sicherer)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Kritische Konfigurationen

### 1. Frontend Environment

**Datei**: `apps/frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://issue-tracker-backend-23d7.onrender.com/api',
};
```

**Wichtig**: 
- ✅ Direkte Backend-URL (nicht `/api` Proxy)
- ✅ Nginx Proxy wird NICHT verwendet
- ✅ CORS ist Backend-seitig konfiguriert

### 2. Backend PrismaService

**Datei**: `apps/backend/src/app/database/prisma.service.ts`

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    // ✅ RICHTIG: Nutzt DATABASE_URL aus Environment
    super();
  }
  // ❌ FALSCH: KEINE hardcoded URL!
  // super({ datasources: { db: { url: 'postgresql://...' } } });
}
```

### 3. Database Connection

**Render Dashboard → PostgreSQL → Connections**

```bash
# ✅ VERWENDE: Internal Database URL (schneller, sicherer)
postgresql://issue_tracker_user:***@dpg-...../issue_tracker_db_1u0p

# ❌ NICHT: External Database URL (langsamer, öffentlich)
postgresql://issue_tracker_user:***@dpg-....frankfurt-postgres.render.com/issue_tracker_db_1u0p
```

### 4. Angular Production Build

**Datei**: `apps/frontend/project.json`

```json
{
  "configurations": {
    "production": {
      "budgets": [...],
      "outputHashing": "all",
      "fileReplacements": [
        {
          "replace": "apps/frontend/src/environments/environment.ts",
          "with": "apps/frontend/src/environments/environment.prod.ts"
        }
      ]
    }
  }
}
```

**Wichtig**: `fileReplacements` sorgt dafür, dass Production-Environment geladen wird!

---

## 📦 Render Services Konfiguration

### PostgreSQL Database

| Setting | Value |
|---------|-------|
| **Name** | issue-tracker-db |
| **Region** | Frankfurt |
| **Database Name** | issue_tracker_db_1u0p |
| **User** | issue_tracker_user |
| **Plan** | Free |
| **Migrations** | ✅ 2 angewandt (init, add_refresh_tokens) |

### Backend Service

| Setting | Value |
|---------|-------|
| **Name** | issue-tracker-backend |
| **Region** | Frankfurt |
| **Plan** | Free |
| **Docker File** | apps/backend/Dockerfile |
| **Health Check** | /api/health |
| **Auto Deploy** | ✅ Yes (bei Push auf master) |

**Environment Variables**:
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=[Internal PostgreSQL URL]
JWT_SECRET=[generiert, 32+ Zeichen]
JWT_REFRESH_SECRET=[generiert, 32+ Zeichen]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://issue-tracker.ademdokur.dev
CORS_ORIGINS=https://issue-tracker.ademdokur.dev
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Frontend Service

| Setting | Value |
|---------|-------|
| **Name** | issue-tracker-frontend |
| **Region** | Frankfurt |
| **Plan** | Free |
| **Docker File** | apps/frontend/Dockerfile |
| **Custom Domain** | issue-tracker.ademdokur.dev |
| **Auto Deploy** | ✅ Yes (bei Push auf master) |

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Datei**: `.github/workflows/deploy-production.yml`

**Trigger**: Push oder Merge auf `master` Branch

**Schritte**:
1. ✅ Checkout Code
2. ✅ Setup Node.js 20
3. ✅ Install Dependencies
4. ✅ Generate Prisma Client (Build-Zeit)
5. ✅ Build Backend (TypeScript Compilation)
6. ✅ Build Frontend (Angular Production)
7. ✅ Trigger Render Deploy (via Webhook)
8. ✅ Health Check Backend (300s Timeout, 5 Retries)
9. ✅ Health Check Frontend

**Deployment-Dauer**: ~7-8 Minuten

---

## 🐳 Docker Configuration

### Backend Dockerfile

**3-Stage Build**:

1. **Dependencies Stage**: npm install
2. **Build Stage**: 
   - Prisma Client generieren (mit dummy URL)
   - TypeScript kompilieren
3. **Production Stage**:
   - Production dependencies only
   - Prisma Client zur Laufzeit NEU generieren
   - Node 20 Alpine, non-root user

**CMD**:
```dockerfile
CMD npx prisma generate --generator client && node dist/main.js
```

**Wichtig**:
- ✅ Prisma Client wird zur **Laufzeit** mit **DATABASE_URL** generiert
- ✅ Build-Zeit: Dummy URL für TypeScript Compilation
- ✅ Runtime: Echte DATABASE_URL aus Render Environment

### Frontend Dockerfile

**3-Stage Build**:

1. **Dependencies**: npm install
2. **Build**: Angular Production Build
3. **Production**: Nginx 1.27 Alpine

**Nginx**: Port 8080, Health Check `/health`

---

## 🔐 Sicherheit

### Environment Variables

- ✅ JWT Secrets: 32+ Zeichen, zufällig generiert
- ✅ Keine Secrets im Code oder Git
- ✅ DATABASE_URL: Render Environment Variable
- ✅ CORS: Nur `issue-tracker.ademdokur.dev` erlaubt

### Docker Security

- ✅ Non-root user (`nestjs:nodejs`)
- ✅ Alpine Linux (minimal attack surface)
- ✅ Security updates via `apk upgrade`
- ✅ Health Checks aktiviert

### Network Security

- ✅ Internal Database URL (nicht öffentlich)
- ✅ HTTPS überall (Render + Cloudflare)
- ✅ Rate Limiting: 100 Requests/60s

---

## 📊 Test-Daten

**Seeded Users**:

| Email | Passwort | Rolle |
|-------|----------|-------|
| admin@example.com | Admin123! | ADMIN |
| manager@example.com | Manager123! | MANAGER |
| developer@example.com | Developer123! | DEVELOPER |
| reporter@example.com | Reporter123! | REPORTER |

**Seeded Daten**:
- 5 Projekte (Logistik-Portal, Web-Shop, KI-System, CRM, ERP)
- 4 Projekt-Mitglieder
- 2 Labels (Bug, Feature)
- 2 Tickets

**Seeds ausführen**:
```bash
$env:DATABASE_URL="[Internal Database URL]"
npx tsx apps/backend/prisma/seed.ts
```

---

## 🚀 Deployment-Befehle

### Manuelles Deployment triggern

```bash
# Commit und Push
git add .
git commit -m "feat: Update XYZ"
git push origin master

# GitHub Actions startet automatisch
# Render deployed automatisch nach erfolgreichem Build
```

### Health Checks

```bash
# Backend
curl https://issue-tracker-backend-23d7.onrender.com/api/health

# Frontend
curl https://issue-tracker.ademdokur.dev/health

# Login testen
curl -X POST https://issue-tracker-backend-23d7.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

### Database Migrations

```bash
# Auf Render automatisch via startCommand
npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma
```

---

## 🐛 Häufige Probleme & Lösungen

### Problem: "Can't reach database at localhost:5435"

**Ursache**: PrismaService hatte hardcoded localhost URL

**Lösung**:
```typescript
// ✅ apps/backend/src/app/database/prisma.service.ts
constructor() {
  super(); // Nutzt DATABASE_URL aus Environment
}
```

### Problem: "502 Bad Gateway" beim Login

**Ursache**: Frontend nutzte Nginx Proxy statt direkte Backend-Verbindung

**Lösung**:
```typescript
// ✅ apps/frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://issue-tracker-backend-23d7.onrender.com/api',
};
```

### Problem: "fileReplacements" fehlt

**Ursache**: Angular Build nutzte Development Environment in Production

**Lösung**:
```json
// ✅ apps/frontend/project.json
"production": {
  "fileReplacements": [{
    "replace": "apps/frontend/src/environments/environment.ts",
    "with": "apps/frontend/src/environments/environment.prod.ts"
  }]
}
```

### Problem: Prisma Client Type Errors (49 Fehler)

**Ursache**: Prisma Client nicht vor Build generiert

**Lösung**:
```dockerfile
# ✅ Dockerfile Build Stage
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    npx prisma generate
```

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Backend Startup** | ~40s (Free Tier Cold Start) |
| **Frontend Load** | ~2s (Static Assets) |
| **API Response** | <100ms (Database query) |
| **Database Connection** | Internal URL = schneller |

---

## ✅ Deployment Checklist

- [x] PostgreSQL Database erstellt (Render)
- [x] Backend Service deployed (Docker)
- [x] Frontend Service deployed (Docker)
- [x] Custom Domain konfiguriert (issue-tracker.ademdokur.dev)
- [x] DATABASE_URL: Internal URL verwendet
- [x] Environment Variables gesetzt (JWT, CORS)
- [x] PrismaService: Keine hardcoded URLs
- [x] Frontend: Direkte Backend-Verbindung
- [x] Angular: fileReplacements konfiguriert
- [x] GitHub Actions: CI/CD funktional
- [x] Health Checks: Backend & Frontend OK
- [x] Database Migrations: Ausgeführt
- [x] Seed-Daten: Importiert
- [x] Login: Funktional
- [x] CORS: Korrekt konfiguriert

---

## 🎉 Erfolg!

**Deployment abgeschlossen**: 30. Dezember 2025  
**Status**: 🟢 Production Ready

**Nächste Schritte**:
1. Monitoring einrichten (Render Logs)
2. Backup-Strategie für Database
3. Custom Error Pages
4. Performance Monitoring
5. Security Audit

---

**Erstellt von**: GitHub Copilot  
**Letzte Aktualisierung**: 30. Dezember 2025
