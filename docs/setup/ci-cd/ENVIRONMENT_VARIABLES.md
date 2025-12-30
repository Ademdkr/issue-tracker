# 🔐 Umgebungsvariablen - Kompletter Leitfaden

Dieser Guide erklärt ausführlich, wie Umgebungsvariablen in diesem Projekt funktionieren und wie sie beim Wechsel zwischen lokaler Entwicklung und Production korrekt gesetzt werden.

## 📋 Inhaltsverzeichnis

- [Grundkonzept](#grundkonzept)
- [Dateistruktur](#dateistruktur)
- [Variablen-Übersicht](#variablen-übersicht)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Umgebungswechsel](#umgebungswechsel)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Grundkonzept

### Was sind Umgebungsvariablen?

Umgebungsvariablen sind **Konfigurationswerte**, die außerhalb des Codes gespeichert werden und zur Laufzeit geladen werden. Sie ermöglichen:

1. **Sicherheit**: Secrets (Passwörter, API-Keys) bleiben außerhalb des Codes
2. **Flexibilität**: Gleicher Code, unterschiedliche Konfigurationen
3. **Deployment**: Einfacher Wechsel zwischen Umgebungen

### Warum brauchen wir verschiedene Umgebungen?

```
┌─────────────────┐     ┌─────────────────┐
│   DEVELOPMENT   │     │   PRODUCTION    │
├─────────────────┤     ├─────────────────┤
│ • Hot Reload    │     │ • Optimiert     │
│ • Debug Logs    │     │ • Minimiert     │
│ • Lokale DB     │     │ • Cloud DB      │
│ • Test Secrets  │     │ • Echte Secrets │
│ • CORS offen    │     │ • CORS strikt   │
└─────────────────┘     └─────────────────┘
```

## 📁 Dateistruktur

### Alle Environment-Dateien im Projekt

```
issue-tracker/
├── .env                          ← Aktive Config (Git ignored)
├── .env.development              ← Development Template (Git tracked)
├── .env.production               ← Production Config (Git ignored)
├── .env.production.template      ← Production Template (Git tracked)
├── .env.docker.example           ← Docker Compose Beispiel
└── apps/backend/
    ├── .env.example              ← Backend Beispiel
    └── .env.backup               ← Backup (falls vorhanden)
```

### Datei-Erklärungen

#### `.env` - Die aktive Konfiguration

```bash
# Diese Datei wird zur Laufzeit geladen
# Sie wird NICHT in Git eingecheckt
# Du erstellst sie durch Kopieren eines Templates
```

**Status**: 🚫 Git ignored (in `.gitignore`)
**Verwendung**: Wird von der Anwendung gelesen
**Erstellen**: `Copy-Item .env.development .env` oder `Copy-Item .env.production.template .env.production`

#### `.env.development` - Development Template

```bash
# Vorkonfiguriert für lokale Entwicklung
# Enthält sichere Defaults für Development
# KANN in Git eingecheckt werden (keine echten Secrets)
```

**Status**: ✅ Git tracked
**Verwendung**: Template für lokale Entwicklung
**Secrets**: Nur Test-Secrets, keine echten Credentials

#### `.env.production` - Production Konfiguration

```bash
# Enthält ECHTE Secrets und Production-URLs
# Wird NIEMALS in Git eingecheckt
# Jeder Entwickler/Server erstellt diese selbst
```

**Status**: 🚫 Git ignored
**Verwendung**: Echte Production-Umgebung
**Secrets**: ECHTE JWT-Secrets, Database-URLs, API-Keys

#### `.env.production.template` - Production Template

```bash
# Zeigt welche Variablen benötigt werden
# Enthält Platzhalter und Beschreibungen
# Wird als Vorlage für .env.production verwendet
```

**Status**: ✅ Git tracked
**Verwendung**: Vorlage zum Erstellen von `.env.production`
**Secrets**: Nur Platzhalter, keine echten Werte

## 📊 Variablen-Übersicht

### Backend-Variablen

| Variable                 | Development                                                      | Production                            | Beschreibung              |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------- | ------------------------- |
| `NODE_ENV`               | `development`                                                    | `production`                          | Laufzeit-Modus            |
| `PORT`                   | `3000`                                                           | `3000`                                | Backend-Port              |
| `DATABASE_URL`           | `postgresql://postgres:postgres@localhost:5435/issue_tracker_db` | Von Render bereitgestellt             | PostgreSQL Verbindung     |
| `JWT_SECRET`             | `dev-secret-key-...`                                             | **MUSS generiert werden**             | JWT Token Secret          |
| `JWT_REFRESH_SECRET`     | `dev-refresh-secret-...`                                         | **MUSS generiert werden**             | Refresh Token Secret      |
| `JWT_EXPIRES_IN`         | `1h`                                                             | `15m`                                 | Access Token Laufzeit     |
| `JWT_REFRESH_EXPIRES_IN` | `30d`                                                            | `7d`                                  | Refresh Token Laufzeit    |
| `FRONTEND_URL`           | `http://localhost:4200`                                          | `https://issue-tracker.ademdokur.dev` | Frontend URL              |
| `CORS_ORIGINS`           | `http://localhost:4200,http://localhost:3000`                    | `https://issue-tracker.ademdokur.dev` | Erlaubte CORS Origins     |
| `THROTTLE_TTL`           | `60000`                                                          | `60000`                               | Rate Limiting Zeitfenster |
| `THROTTLE_LIMIT`         | `100`                                                            | `10`                                  | Rate Limiting Anzahl      |
| `DEBUG`                  | `true`                                                           | `false`                               | Debug-Modus               |
| `LOG_LEVEL`              | `debug`                                                          | `warn`                                | Log-Level                 |

### Docker-Compose Variablen

| Variable                   | Development              | Production               | Beschreibung     |
| -------------------------- | ------------------------ | ------------------------ | ---------------- |
| `POSTGRES_DB`              | `issue_tracker_db`       | `issue_tracker_db`       | Datenbank-Name   |
| `POSTGRES_USER`            | `postgres`               | `postgres`               | DB-Benutzer      |
| `POSTGRES_PASSWORD`        | `postgres`               | **Sicheres Passwort**    | DB-Passwort      |
| `PGADMIN_DEFAULT_EMAIL`    | `admin@issuetracker.com` | `admin@issuetracker.com` | pgAdmin Login    |
| `PGADMIN_DEFAULT_PASSWORD` | `admin123`               | **Sicheres Passwort**    | pgAdmin Passwort |

## 🛠️ Development Setup

### Schritt-für-Schritt: Development Environment einrichten

#### 1. Environment-Datei erstellen

```powershell
# PowerShell
Copy-Item .env.development .env
```

```bash
# Bash/Linux/Mac
cp .env.development .env
```

#### 2. Überprüfen der Variablen

Öffne `.env` und prüfe die Werte:

```dotenv
# .env (für Development)
NODE_ENV=development
PORT=3000

# Lokale Datenbank (Docker Container auf Port 5435)
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/issue_tracker_db?schema=public

# Development Secrets (NUR für lokale Entwicklung!)
JWT_SECRET=dev-secret-key-only-for-local-development-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-key-only-for-local-development-min-32-chars

# Token Laufzeiten (länger für Development)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# Lokales Frontend
FRONTEND_URL=http://localhost:4200

# Permissive CORS für Development
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# Debug aktiviert
DEBUG=true
LOG_LEVEL=debug
```

#### 3. Variablen verstehen

**`DATABASE_URL`**

```
postgresql://postgres:postgres@localhost:5435/issue_tracker_db?schema=public
           ↑         ↑          ↑         ↑            ↑
        Username  Password    Host     Port      Database
```

- `postgres:postgres` - User und Passwort vom Docker Container
- `localhost:5435` - Lokaler Docker Container (Port 5435 statt 5432 um Konflikte zu vermeiden)
- `issue_tracker_db` - Datenbank-Name

**`JWT_SECRET` / `JWT_REFRESH_SECRET`**

- Für Development sind die Werte vordefiniert
- **WARNUNG**: Diese Secrets sind NICHT sicher für Production!
- Sie sind absichtlich im Template, weil sie nur lokal verwendet werden

**`CORS_ORIGINS`**

- Erlaubt Anfragen von localhost:4200 (Frontend) und localhost:3000 (Backend)
- Comma-separated Liste
- In Development permissiv, in Production restriktiv

#### 4. Wie NestJS die Variablen lädt

```typescript
// apps/backend/src/main.ts
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  envFilePath: '.env', // Lädt .env vom Root
  isGlobal: true, // Variablen global verfügbar
  expandVariables: true, // Unterstützt ${VAR} Syntax
});

// Verwendung im Code
const jwtSecret = process.env.JWT_SECRET;
const dbUrl = process.env.DATABASE_URL;
```

#### 5. Wie Angular die Variablen verwendet

Angular kann Environment-Variablen **NICHT direkt** zur Laufzeit lesen. Stattdessen:

```typescript
// apps/frontend/src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};

// apps/frontend/src/environments/environment.ts (Production)
export const environment = {
  production: true,
  apiUrl: '/api', // Nginx proxy
};
```

**Build-Zeit vs. Laufzeit:**

- NestJS (Backend): Lädt `.env` zur **Laufzeit** ✅
- Angular (Frontend): Verwendet `environment.ts` zur **Build-Zeit** ✅

## 🚀 Production Setup

### Schritt-für-Schritt: Production Environment einrichten

#### 1. Production Template kopieren

```powershell
# PowerShell
Copy-Item .env.production.template .env.production
```

```bash
# Bash
cp .env.production.template .env.production
```

#### 2. JWT Secrets generieren

**Option A: OpenSSL (empfohlen)**

```bash
# JWT Secret generieren
openssl rand -base64 32

# Ausgabe z.B.:
# 8K7x9mN2pQ3wR5tY6uI8oP0aS1dF4gH7jK9lZ2xC3vB5nM8

# JWT Refresh Secret generieren
openssl rand -base64 32

# Ausgabe z.B.:
# 3vB5nM8qW9eR0tY1uI2oP3aS4dF5gH6jK7lZ8xC9vB0nM1
```

**Option B: Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: PowerShell**

```powershell
# JWT Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Oder mit System.Security.Cryptography
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### 3. `.env.production` bearbeiten

Öffne `.env.production` in VS Code:

```bash
code .env.production
```

Fülle ALLE Werte aus:

```dotenv
# .env.production
NODE_ENV=production
PORT=3000

# ⚠️ WICHTIG: Wird von Render automatisch bereitgestellt
# Wenn Render PostgreSQL Service verbunden ist, wird diese Variable automatisch gesetzt
DATABASE_URL=postgresql://user:password@host:5432/database

# ⚠️ KRITISCH: Hier die generierten Secrets einfügen!
JWT_SECRET=8K7x9mN2pQ3wR5tY6uI8oP0aS1dF4gH7jK9lZ2xC3vB5nM8
JWT_REFRESH_SECRET=3vB5nM8qW9eR0tY1uI2oP3aS4dF5gH6jK7lZ8xC9vB0nM1

# Token Laufzeiten (kürzer für Production)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Production Frontend URL
FRONTEND_URL=https://issue-tracker.ademdokur.dev

# Strikt: Nur Production Domain
CORS_ORIGINS=https://issue-tracker.ademdokur.dev

# Rate Limiting (strenger)
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

#### 4. Variablen auf Render setzen

Wenn du auf Render deployst, musst du die Secrets auch in der Render-Oberfläche setzen:

**Render Dashboard:**

1. Gehe zu deinem Backend-Service
2. Klicke auf "Environment"
3. Füge die Variablen hinzu:

```
JWT_SECRET = 8K7x9mN2pQ3wR5tY6uI8oP0aS1dF4gH7jK9lZ2xC3vB5nM8
JWT_REFRESH_SECRET = 3vB5nM8qW9eR0tY1uI2oP3aS4dF5gH6jK7lZ8xC9vB0nM1
FRONTEND_URL = https://issue-tracker.ademdokur.dev
CORS_ORIGINS = https://issue-tracker.ademdokur.dev
NODE_ENV = production
```

**WICHTIG**: `DATABASE_URL` wird automatisch von Render gesetzt, wenn du den PostgreSQL Service verbindest!

#### 5. Docker Production Build (lokal testen)

Für lokales Production-Testing mit Docker:

```bash
# 1. .env.production erstellt und ausgefüllt ✅

# 2. Docker Compose verwendet automatisch .env.production
# Editiere docker-compose.yml wenn nötig

# 3. Starten
npm run prod:local

# 4. Testen
# Frontend: http://localhost:80
# Backend: http://localhost:3000/api
# Health: http://localhost:3000/api/health
```

## 🔄 Umgebungswechsel im Detail

### Szenario 1: Von Development zu Production (Lokal testen)

**Warum?** Du willst den Production-Build lokal testen, bevor du auf Render deployst.

```bash
# ===== SCHRITT 1: Development beenden =====

# A. Alle Running Terminals stoppen
# Drücke Ctrl+C in allen Terminals wo nx serve läuft

# B. Development Datenbank stoppen
npm run dev:db:stop

# Ausgabe:
# [+] Running 3/3
#  ✔ Container issue-tracker-pgadmin-dev  Removed
#  ✔ Container issue-tracker-postgres-dev Removed
#  ✔ Network issue-tracker_issue-tracker-network Removed


# ===== SCHRITT 2: Production Environment vorbereiten =====

# A. .env.production erstellen (falls noch nicht vorhanden)
Copy-Item .env.production.template .env.production

# B. Secrets generieren
openssl rand -base64 32  # → Kopiere Ergebnis
openssl rand -base64 32  # → Kopiere Ergebnis

# C. .env.production editieren
code .env.production
# → JWT_SECRET einfügen
# → JWT_REFRESH_SECRET einfügen
# → Alle anderen Werte prüfen

# D. .env.production als .env verwenden (für docker-compose)
Copy-Item .env.production .env


# ===== SCHRITT 3: Production starten =====

# A. Docker Images bauen und starten
npm run prod:local

# Ausgabe:
# [+] Building 100.5s (34/34) FINISHED
# [+] Running 4/4
#  ✔ Network issue-tracker_issue-tracker-network  Created
#  ✔ Container issue-tracker-postgres              Started
#  ✔ Container issue-tracker-backend               Started
#  ✔ Container issue-tracker-frontend              Started

# B. Logs verfolgen (in neuem Terminal)
npm run docker:logs

# C. Health Checks prüfen
# Backend:
curl http://localhost:3000/api/health

# Frontend:
curl http://localhost:80


# ===== SCHRITT 4: Testen =====

# Öffne Browser:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:3000/api
# - pgAdmin: http://localhost:5050

# Login testen, Features testen, Performance prüfen


# ===== SCHRITT 5: Logs und Debugging =====

# Container Logs einzeln
docker logs issue-tracker-backend -f
docker logs issue-tracker-frontend -f
docker logs issue-tracker-postgres -f

# In Container einloggen
docker exec -it issue-tracker-backend sh

# Datenbank prüfen
docker exec -it issue-tracker-postgres psql -U postgres -d issue_tracker_db
```

### Szenario 2: Von Production zu Development (Zurück zur Entwicklung)

**Warum?** Production-Testing abgeschlossen, zurück zu normalem Development-Workflow.

```bash
# ===== SCHRITT 1: Production beenden =====

# A. Docker Compose stoppen
npm run docker:down

# Ausgabe:
# [+] Running 4/4
#  ✔ Container issue-tracker-frontend  Removed
#  ✔ Container issue-tracker-backend   Removed
#  ✔ Container issue-tracker-postgres  Removed
#  ✔ Container issue-tracker-pgadmin   Removed

# B. (Optional) Docker Volumes löschen (wenn DB zurücksetzen)
docker-compose down -v

# C. (Optional) Docker Images löschen (wenn neu bauen)
docker rmi issue-tracker-backend issue-tracker-frontend


# ===== SCHRITT 2: Development Environment aktivieren =====

# A. .env.development als .env verwenden
Copy-Item .env.development .env

# B. Prüfen
Get-Content .env -Head 10

# Sollte zeigen:
# NODE_ENV=development
# DATABASE_URL=postgresql://postgres:postgres@localhost:5435/...


# ===== SCHRITT 3: Development starten =====

# A. Development Datenbank starten
npm run dev:db:start

# Ausgabe:
# [+] Running 3/3
#  ✔ Network issue-tracker_issue-tracker-network Created
#  ✔ Container issue-tracker-postgres-dev        Started
#  ✔ Container issue-tracker-pgadmin-dev         Started

# B. Warten bis PostgreSQL ready ist (10-15 Sekunden)
Start-Sleep -Seconds 15

# C. Prisma Migrationen anwenden (falls nötig)
npx prisma migrate dev --schema=./apps/backend/prisma/schema.prisma

# D. Development Server starten
npm run dev

# Oder separat:
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2


# ===== SCHRITT 4: Development Workflow =====

# Prisma Studio öffnen (Datenbank GUI)
npm run prisma:studio

# Code editieren → Hot Reload aktiv! ✨
# Keine Neustarts nötig

# Tests laufen lassen
npm run test:backend
npm run test:frontend
```

### Szenario 3: Production Deployment auf Render

**Warum?** Von lokalem Production-Test zu echtem Live-Deployment.

```bash
# ===== VORBEREITUNG =====

# 1. Render Blueprint bereits erstellt ✅
#    → render.yaml im Repository

# 2. Secrets auf Render setzen (über Dashboard):
#    JWT_SECRET
#    JWT_REFRESH_SECRET
#    FRONTEND_URL=https://issue-tracker.ademdokur.dev
#    CORS_ORIGINS=https://issue-tracker.ademdokur.dev

# 3. Code auf GitHub pushen
git add .
git commit -m "feat: Prepare for production deployment"
git push origin master

# 4. Render erkennt Push und startet automatisch:
#    → PostgreSQL Database erstellen
#    → Backend Service bauen (Dockerfile)
#    → Frontend Service bauen (Dockerfile)
#    → Environment Variables einfügen
#    → Migrations ausführen
#    → Services starten

# 5. Custom Domain konfigurieren (Render Dashboard):
#    → issue-tracker.ademdokur.dev
#    → DNS CNAME Record hinzufügen

# 6. SSL/TLS wird automatisch von Render bereitgestellt ✅
```

## 🎓 Best Practices

### ✅ DO's (Empfohlene Praktiken)

#### 1. Niemals Secrets in Git committen

```bash
# ❌ FALSCH
git add .env.production
git commit -m "Add production config"

# ✅ RICHTIG
# .env.production ist bereits in .gitignore
git add .env.production.template
git commit -m "Update production template"
```

#### 2. Starke Secrets verwenden

```bash
# ❌ FALSCH (zu kurz)
JWT_SECRET=mysecret

# ❌ FALSCH (vorhersehbar)
JWT_SECRET=password123

# ✅ RICHTIG (32+ Zeichen, zufällig)
JWT_SECRET=8K7x9mN2pQ3wR5tY6uI8oP0aS1dF4gH7jK9lZ2xC3vB5nM8
```

#### 3. Environment-spezifische Werte

```dotenv
# ❌ FALSCH (Production URL in Development)
# .env.development
FRONTEND_URL=https://issue-tracker.ademdokur.dev

# ✅ RICHTIG
# .env.development
FRONTEND_URL=http://localhost:4200

# .env.production
FRONTEND_URL=https://issue-tracker.ademdokur.dev
```

#### 4. Templates dokumentieren

```dotenv
# ✅ RICHTIG - Template mit Erklärungen
# .env.production.template

# JWT Secret - MUSS vor Deployment generiert werden!
# Mindestens 32 Zeichen
# Generieren mit: openssl rand -base64 32
JWT_SECRET=

# Database URL - Wird automatisch von Render bereitgestellt
# Format: postgresql://user:password@host:port/database
DATABASE_URL=
```

#### 5. `.gitignore` korrekt setzen

```gitignore
# ✅ In .gitignore

# Alle .env Dateien außer Templates
.env
.env.local
.env.production
.env.docker

# Templates dürfen getrackt werden
!.env.development
!.env.production.template
```

#### 6. Validierung im Code

```typescript
// ✅ RICHTIG - Validierung beim Start
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

ConfigModule.forRoot({
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required(),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  }),
});
```

### ❌ DON'Ts (Zu vermeidende Praktiken)

#### 1. Hardcoded Secrets im Code

```typescript
// ❌ NIEMALS!
const jwtSecret = 'my-super-secret-key';

// ✅ Immer aus Environment laden
const jwtSecret = process.env.JWT_SECRET;
```

#### 2. Development Secrets in Production

```dotenv
# ❌ GEFÄHRLICH!
# .env.production
JWT_SECRET=dev-secret-key-only-for-local-development
```

#### 3. Sensible Daten im Frontend

```typescript
// ❌ FALSCH - JWT Secret im Frontend
// apps/frontend/src/environments/environment.ts
export const environment = {
  jwtSecret: 'secret123', // ❌ Nie!
};

// ✅ RICHTIG - Nur Backend hat Secrets
// Frontend braucht nur die Backend-URL
export const environment = {
  apiUrl: 'http://localhost:3000/api',
};
```

#### 4. `.env` Dateien in Docker Images

```dockerfile
# ❌ FALSCH
COPY .env .env

# ✅ RICHTIG - Environment zur Laufzeit
# docker-compose.yml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - DATABASE_URL=${DATABASE_URL}
```

## 🔍 Troubleshooting

### Problem 1: "Cannot find module .env"

**Symptome:**

```
Error: ENOENT: no such file or directory, open '.env'
```

**Lösung:**

```bash
# .env Datei fehlt
# Für Development:
Copy-Item .env.development .env

# Für Production:
Copy-Item .env.production.template .env.production
# → Secrets eintragen
Copy-Item .env.production .env
```

### Problem 2: "JWT_SECRET must be at least 32 characters"

**Symptome:**

```
ValidationError: "JWT_SECRET" length must be at least 32 characters long
```

**Lösung:**

```bash
# Neues Secret generieren
openssl rand -base64 32

# In .env eintragen
# JWT_SECRET=<generiertes-secret>
```

### Problem 3: Database Connection Failed

**Symptome:**

```
Error: P1001: Can't reach database server at localhost:5435
```

**Lösung für Development:**

```bash
# 1. Prüfen ob PostgreSQL Container läuft
docker ps | Select-String postgres

# 2. Wenn nicht, starten
npm run dev:db:start

# 3. 15 Sekunden warten
Start-Sleep -Seconds 15

# 4. DATABASE_URL in .env prüfen
# Sollte sein: postgresql://postgres:postgres@localhost:5435/issue_tracker_db
```

**Lösung für Production (Docker):**

```bash
# 1. Prüfen ob PostgreSQL Container läuft
docker ps

# 2. docker-compose.yml prüfen
# Backend muss depends_on: postgres haben

# 3. Neu starten
npm run docker:down
npm run prod:local
```

### Problem 4: CORS Errors

**Symptome:**

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Lösung:**

```bash
# 1. CORS_ORIGINS in .env prüfen

# Development:
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# Production:
CORS_ORIGINS=https://issue-tracker.ademdokur.dev

# 2. Komma-separated, keine Leerzeichen!

# 3. Backend neu starten
```

### Problem 5: Environment nicht geladen

**Symptome:**

```typescript
console.log(process.env.JWT_SECRET); // undefined
```

**Lösung:**

```bash
# 1. .env Datei im richtigen Verzeichnis?
# Muss im Root sein (wo package.json ist)

# 2. ConfigModule korrekt importiert?
# apps/backend/src/app/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
})

# 3. Variable richtig geschrieben?
# Groß-/Kleinschreibung beachten!
JWT_SECRET=...    # ✅
jwt_secret=...    # ❌
Jwt_Secret=...    # ❌
```

### Problem 6: Production Build unterscheidet sich von Development

**Symptome:**

- Funktioniert in Development
- Fehler in Production Build

**Lösung:**

```bash
# 1. Production Build lokal testen
npm run build:backend
npm run build:frontend

# 2. Ausgabe prüfen
ls dist/apps/backend
ls dist/apps/frontend/browser

# 3. Environment-Dateien prüfen
# Angular: apps/frontend/src/environments/environment.ts
# NestJS: .env

# 4. Docker Build testen
npm run docker:build:all
npm run prod:local
```

### Problem 7: Secrets auf Render nicht gesetzt

**Symptome:**

- Deployment schlägt fehl
- "JWT_SECRET is required"

**Lösung:**

```bash
# 1. Render Dashboard öffnen
# 2. Backend Service → Environment
# 3. Variablen hinzufügen:

Key                    Value
JWT_SECRET            → [generiertes Secret]
JWT_REFRESH_SECRET    → [generiertes Secret]
FRONTEND_URL          → https://issue-tracker.ademdokur.dev
CORS_ORIGINS          → https://issue-tracker.ademdokur.dev

# 4. "Save Changes" klicken
# 5. Automatischer Redeploy startet
```

## 📚 Weitere Ressourcen

- **Environment Switch**: [ENVIRONMENT_SWITCH.md](./ENVIRONMENT_SWITCH.md)
- **Development Workflow**: [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
- **Docker Setup**: [DOCKER_SETUP_ANLEITUNG.md](./DOCKER_SETUP_ANLEITUNG.md)
- **Render Deployment**: [../deployment/RENDER_DEPLOYMENT.md](../deployment/RENDER_DEPLOYMENT.md)

## 🔐 Sicherheits-Checkliste

Vor Production Deployment:

- [ ] `.env.production` erstellt und Secrets generiert
- [ ] JWT Secrets mindestens 32 Zeichen lang
- [ ] DATABASE_URL auf Render konfiguriert
- [ ] CORS_ORIGINS nur Production Domain enthält
- [ ] `.env.production` NICHT in Git committed
- [ ] Render Environment Variables gesetzt
- [ ] Production Build lokal getestet
- [ ] Health Checks funktionieren
- [ ] SSL/TLS auf Render aktiviert
- [ ] Rate Limiting konfiguriert

---

**Wichtig**: Behandle `.env.production` wie ein Passwort - niemals teilen, niemals committen, niemals in Logs ausgeben!
