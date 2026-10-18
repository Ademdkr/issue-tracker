> Historisches Dokument. Maßgeblich sind [Deployment](../../../deployment/README.md) und [Schnellstart](../../../QUICKSTART.md). Beispiele können veraltet sein.

# Development Workflow Guide

Dieser Guide erklärt, wie zwischen lokaler Entwicklung und Production-Umgebungen gewechselt wird.

## 📋 Inhaltsverzeichnis

- [Umgebungsübersicht](#umgebungsübersicht)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Production Testing](#production-testing)
- [Umgebungswechsel](#umgebungswechsel)
- [Best Practices](#best-practices)

## 🌍 Umgebungsübersicht

### Development (Lokal)

- **Backend**: Läuft auf Port 3000 (nx serve backend)
- **Frontend**: Läuft auf Port 4200 (nx serve frontend)
- **Database**: PostgreSQL auf Port 5435 (Docker)
- **Env File**: `config/env/development.env.example`

### Production (Render/Docker)

- **Backend**: Docker Container auf Port 3000
- **Frontend**: Nginx Container auf Port 8080
- **Database**: Render PostgreSQL oder Docker
- **Env File**: `.env.production`

## 🚀 Lokale Entwicklung

### 1. Erstmalige Einrichtung

```bash
# 1. Entwicklungs-Umgebungsvariablen vorbereiten
cp config/env/development.env.example .env

# 2. Dependencies installieren
npm install

# 3. PostgreSQL starten (nur Datenbank)
docker compose --project-directory . -f docker/docker-compose.dev.yml up -d

# 4. Prisma Setup
npm run prisma:generate
npx prisma migrate dev --schema=./apps/backend/prisma/schema.prisma
npm run prisma:seed

# 5. pgAdmin öffnen (optional)
# URL: http://localhost:5050
# Email: admin@issuetracker.com
# Password: admin123
```

### 2. Entwicklungsserver starten

**Option A: Nx Development Server (empfohlen)**

```bash
# Backend starten (mit Hot Reload)
npx nx serve backend

# Frontend starten (mit Hot Reload)
npx nx serve frontend

# Oder beide parallel
npm run dev
```

**Option B: Build und Start**

```bash
# Backend bauen und starten
npm run build:backend
node dist/apps/backend/main.js

# Frontend bauen und serven
npm run build:frontend
npx http-server dist/apps/frontend/browser -p 4200
```

### 3. Entwicklungs-Datenbank verwalten

```bash
# Prisma Studio öffnen (GUI für Datenbank)
npm run prisma:studio

# Neue Migration erstellen
npx prisma migrate dev --name beschreibung-der-änderung --schema=./apps/backend/prisma/schema.prisma

# Datenbank zurücksetzen und neu seeden
npx prisma migrate reset --schema=./apps/backend/prisma/schema.prisma
npm run prisma:seed
```

## 🐳 Production Testing (Lokal mit Docker)

### 1. Production Build mit Docker Compose

```bash
# 1. Production Environment setzen
cp config/env/production.env.example .env.production

# 2. JWT Secrets generieren
openssl rand -base64 32  # Für JWT_SECRET
openssl rand -base64 32  # Für JWT_REFRESH_SECRET

# 3. .env.production bearbeiten und Secrets eintragen

# 4. Docker Compose starten (production)
docker-compose up --build -d

# 5. Logs verfolgen
npm run docker:logs

# 6. Anwendung testen
# Frontend: http://localhost:80
# Backend: http://localhost:3000/api
```

### 2. Production Build separat testen

```bash
# Backend Image bauen und testen
npm run docker:build:backend
docker run -p 3000:3000 --env-file .env.production issue-tracker-backend

# Frontend Image bauen und testen
npm run docker:build:frontend
docker run -p 8080:8080 issue-tracker-frontend
```

## 🔄 Umgebungswechsel

### Von Development zu Production

```bash
# 1. Development Server stoppen (Ctrl+C)

# 2. Development Datenbank stoppen
docker compose --project-directory . -f docker/docker-compose.dev.yml down

# 3. Production Environment laden
cp config/env/production.env.example .env.production
# JWT Secrets generieren und in .env.production eintragen

# 4. Docker Compose Production starten
docker-compose up --build -d
```

### Von Production zu Development

```bash
# 1. Production Container stoppen
docker-compose down

# 2. Development Environment laden
cp config/env/development.env.example .env

# 3. Development Datenbank starten
docker compose --project-directory . -f docker/docker-compose.dev.yml up -d

# 4. Development Server starten
npx nx serve backend
npx nx serve frontend
```

## 📝 Best Practices

### Umgebungsvariablen

1. **NIE echte Production-Secrets committen**

   - `.env.production` ist in `.gitignore`
   - Nur `config/env/production.env.example` wird versioniert

2. **Development und Production trennen**

   ```bash
   # Development
   config/env/development.env.example  → Tracked in Git

   # Production
   .env.production   → NOT tracked (add real secrets)
   config/env/production.env.example → Tracked (template only)
   ```

3. **Secrets generieren**

   ```bash
   # JWT Secrets (min. 32 Zeichen)
   openssl rand -base64 32

   # Oder mit Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### NPM Scripts für Umgebungswechsel

Füge zu `package.json` hinzu:

```json
{
  "scripts": {
    "dev": "nx run-many -t serve --projects=backend,frontend --parallel",
    "dev:backend": "nx serve backend",
    "dev:frontend": "nx serve frontend",
    "dev:db:start": "docker compose --project-directory . -f docker/docker-compose.dev.yml up -d",
    "dev:db:stop": "docker compose --project-directory . -f docker/docker-compose.dev.yml down",
    "prod:local": "docker-compose up --build",
    "prod:local:detached": "docker-compose up --build -d"
  }
}
```

### Git Workflow

```bash
# 1. Feature Branch erstellen
git checkout -b feature/mein-feature

# 2. Entwickeln mit Development Setup
npm run dev:db:start
npx nx serve backend

# 3. Vor Commit: Tests und Validierung
npm run validate

# 4. Vor Push: Production Build testen
npm run docker:build:all

# 5. Push und PR erstellen
git push origin feature/mein-feature
```

### Datenbank-Migrationen

**Development:**

```bash
# Änderung am Schema
# apps/backend/prisma/schema.prisma bearbeiten

# Migration erstellen
npx prisma migrate dev --name add-new-field --schema=./apps/backend/prisma/schema.prisma

# Prisma Client generieren
npm run prisma:generate
```

**Production:**

```bash
# Migrations werden automatisch beim Docker-Build angewendet
# Oder manuell im Production Container:
docker exec -it issue-tracker-backend npx prisma migrate deploy
```

### Debugging

**Development:**

```bash
# Backend Debugging (VS Code)
# Launch configuration bereits vorhanden
F5 drücken in VS Code

# Frontend Debugging
# Chrome DevTools
# Angular DevTools Extension
```

**Production (Docker):**

```bash
# Container Logs
docker logs issue-tracker-backend -f
docker logs issue-tracker-frontend -f

# In Container einloggen
docker exec -it issue-tracker-backend sh

# Datenbank prüfen
docker exec -it issue-tracker-postgres psql -U postgres -d issue_tracker_db
```

## 🔍 Troubleshooting

### Port bereits in Verwendung

```bash
# Port 3000 freigeben (Backend)
npx kill-port 3000

# Port 4200 freigeben (Frontend)
npx kill-port 4200

# Port 5435 freigeben (PostgreSQL)
docker compose --project-directory . -f docker/docker-compose.dev.yml down
```

### Prisma Client out of sync

```bash
# Prisma Client neu generieren
npm run prisma:generate

# Oder komplett neu bauen
npx prisma migrate reset --schema=./apps/backend/prisma/schema.prisma
npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma
npm run prisma:generate
```

### Docker Build Fehler

```bash
# Docker Cache löschen
docker builder prune -a

# Neustart mit komplettem Rebuild
docker-compose down -v
docker-compose up --build --force-recreate
```

## 📚 Weitere Ressourcen

- [Docker Setup Guide](DOCKER_SETUP_ANLEITUNG.md)
- [Prisma Setup Guide](../../../setup/PRISMA_SETUP_ANLEITUNG.md)
- [Deployment Guide](../../../deployment/README.md)
- [NestJS CLI Guide](../../../setup/NESTJS_CLI_ANLEITUNG.md)
