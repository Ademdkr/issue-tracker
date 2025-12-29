# 1.1 Render Blueprint erstellen

## 📋 Übersicht

Der Render Blueprint ist eine YAML-Konfigurationsdatei, die die gesamte Infrastruktur als Code (Infrastructure as Code) definiert. Sie ermöglicht das automatische Deployment aller Services mit einem Klick.

---

## 🎯 Ziel

Erstelle eine `render.yaml` Datei im Projekt-Root, die folgende Services definiert:

- PostgreSQL Datenbank
- NestJS Backend API
- Angular Frontend mit Nginx

---

## 📁 Datei erstellen

**Speicherort**: `render.yaml` (im Projekt-Root)

Die Datei wurde bereits im Repository erstellt. Sie enthält die komplette Infrastruktur-Definition.

---

## 🔍 Blueprint-Struktur erklärt

### Database Service

```yaml
- type: pserv # PostgreSQL Service
  name: issue-tracker-db # Service-Name in Render
  env: production # Umgebung
  plan: free # Free Tier (oder starter/standard)
  region: frankfurt # EU Region (oder oregon für US)
  databaseName: issue_tracker_db # Datenbankname
  databaseUser: postgres # DB User
  ipAllowList: [] # Leer = alle Render Services erlaubt
```

**Wichtig**:

- `ipAllowList: []` erlaubt Zugriff von allen Render Services im gleichen Account
- Für externe Zugriffe (z.B. von außerhalb) IPs hinzufügen

---

### Backend Service

```yaml
- type: web # Web Service
  name: issue-tracker-backend # Service-Name
  env: production # Umgebung
  runtime: docker # Docker Runtime
  plan: free # Free Tier
  region: frankfurt # Gleiche Region wie DB
  dockerfilePath: ./apps/backend/Dockerfile # Pfad zum Dockerfile
  dockerContext: . # Build-Kontext (Projekt-Root)
  healthCheckPath: /api/health # Health Check Endpoint
```

**Environment Variables**:

| Variable             | Quelle          | Beschreibung                       |
| -------------------- | --------------- | ---------------------------------- |
| `NODE_ENV`           | Statischer Wert | `production`                       |
| `PORT`               | Statischer Wert | `3000`                             |
| `DATABASE_URL`       | Von Datenbank   | Automatisch verknüpft              |
| `JWT_SECRET`         | Manuell setzen  | `sync: false` = nicht im Blueprint |
| `JWT_REFRESH_SECRET` | Manuell setzen  | `sync: false` = nicht im Blueprint |
| `FRONTEND_URL`       | Statischer Wert | Domain nach Custom Domain Setup    |
| `CORS_ORIGINS`       | Statischer Wert | Erlaubte Origins für CORS          |

**Warum `sync: false` für Secrets?**

- Secrets sollten NICHT in der render.yaml stehen (Security)
- Werden manuell im Render Dashboard konfiguriert
- Verhindert versehentliches Committen von Secrets

---

### Frontend Service

```yaml
- type: web # Web Service
  name: issue-tracker-frontend # Service-Name
  env: production # Umgebung
  runtime: docker # Docker Runtime
  plan: free # Free Tier
  region: frankfurt # Gleiche Region
  dockerfilePath: ./apps/frontend/Dockerfile # Pfad zum Dockerfile
  dockerContext: . # Build-Kontext (Projekt-Root)
```

**Environment Variables**:

| Variable      | Quelle              | Beschreibung                            |
| ------------- | ------------------- | --------------------------------------- |
| `BACKEND_URL` | Von Backend Service | Automatisch verknüpft via `fromService` |

**Service-Verknüpfung**:

```yaml
fromService:
  name: issue-tracker-backend # Name des Backend Service
  type: web # Service-Typ
  envVarKey: RENDER_EXTERNAL_URL # Render-interne URL Variable
```

Dies erstellt automatisch die Backend-URL für das Frontend.

---

## ✅ Validierung

Prüfe, ob die `render.yaml` folgende Anforderungen erfüllt:

### Struktur-Checklist

- [x] **3 Services definiert**: Database, Backend, Frontend
- [x] **Gleiche Region**: Alle Services in `frankfurt` (niedrigere Latenz)
- [x] **Docker Runtime**: Backend und Frontend nutzen Docker
- [x] **Health Check**: Backend hat `/api/health` definiert
- [x] **Database Linking**: Backend `DATABASE_URL` kommt von DB
- [x] **Service Linking**: Frontend `BACKEND_URL` kommt von Backend
- [x] **Secrets extern**: `JWT_SECRET` und `JWT_REFRESH_SECRET` haben `sync: false`

### Sicherheits-Checklist

- [x] **Keine Secrets im Code**: Sensitive Werte mit `sync: false` markiert
- [x] **Production Environment**: `env: production` für alle Services
- [x] **IP Allowlist**: Datenbank nur von Render Services erreichbar
- [x] **CORS Origins**: Auf Production Domain beschränkt

---

## 🚀 Nächste Schritte

Nach Erstellung der `render.yaml`:

1. **Commit & Push**:

   ```bash
   git add render.yaml
   git commit -m "feat: Add Render Blueprint configuration"
   git push origin feature/deployment-preparation
   ```

2. **Secrets vorbereiten**:

   - JWT_SECRET generieren: `openssl rand -base64 32`
   - JWT_REFRESH_SECRET generieren: `openssl rand -base64 32`
   - In separater Datei notieren (NICHT committen!)

3. **Blueprint in Render importieren**:
   - Gehe zu [Render Dashboard](https://dashboard.render.com)
   - Klicke "New +" → "Blueprint"
   - Wähle GitHub Repository: `Ademdkr/issue-tracker`
   - Branch: `master` (nach Merge)
   - Render erkennt automatisch die `render.yaml`

---

## 📝 Wichtige Hinweise

### Region-Auswahl

**Frankfurt** (EU):

- ✅ DSGVO-konform
- ✅ Niedrigere Latenz für EU-Nutzer
- ✅ Empfohlen für `ademdokur.dev`

**Oregon** (US):

- ✅ Niedrigere Latenz für US-Nutzer
- ⚠️ Höhere Latenz für EU

### Free Plan Limitierungen

**PostgreSQL Free**:

- 90 Tage Speicherung
- 1 GB RAM
- Keine automatischen Backups
- ⚠️ Nach 90 Tagen: Upgrade auf Starter ($7/Monat) oder Datenverlust

**Web Service Free**:

- 750 Stunden/Monat (ausreichend für 1 Service)
- Service schläft nach 15 Min. Inaktivität
- ⚠️ Erste Anfrage nach Sleep: ~30s Startup-Zeit

**Upgrade-Empfehlung für Production**:

- Database: Starter Plan ($7/Monat) für Backups
- Backend: Starter Plan ($7/Monat) für Always-On
- Frontend: Free ausreichend (statisch, wacht schnell auf)

---

## 🔧 Troubleshooting

### Fehler: "Invalid YAML syntax"

**Ursache**: YAML-Formatierung falsch

**Lösung**:

- Prüfe Einrückung (2 Spaces, keine Tabs)
- Validiere mit: https://www.yamllint.com/
- Vergleiche mit Render Blueprint Docs

### Fehler: "Service name already exists"

**Ursache**: Service-Name bereits in Render verwendet

**Lösung**:

- Ändere `name:` auf eindeutigen Wert
- Z.B. `issue-tracker-backend-prod`

### Warnung: "Free plan limitations"

**Ursache**: Free Plan hat Einschränkungen

**Lösung**:

- Akzeptieren für Development/Portfolio
- Für Production: Upgrade auf Starter Plan

---

## 📚 Weitere Ressourcen

- [Render Blueprint Specification](https://render.com/docs/blueprint-spec)
- [Render Database Documentation](https://render.com/docs/databases)
- [Render Docker Deployments](https://render.com/docs/docker)
- [Environment Variables in Render](https://render.com/docs/environment-variables)

---

## ✅ Status

- [x] `render.yaml` erstellt im Projekt-Root
- [x] 3 Services definiert (DB, Backend, Frontend)
- [x] Secrets als `sync: false` markiert
- [x] Dokumentation erstellt

**Bereit für nächsten Schritt**: 1.2 Umgebungsvariablen vorbereiten

---

**Schritt abgeschlossen**: ✅  
**Dauer**: ~5 Minuten  
**Nächster Schritt**: Secrets generieren und notieren
