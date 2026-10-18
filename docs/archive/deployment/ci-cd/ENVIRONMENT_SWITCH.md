> Historisches Dokument. Maßgeblich sind [Deployment](../../../deployment/README.md) und [Schnellstart](../../../QUICKSTART.md). Beispiele können veraltet sein.

# 🔄 Umgebungswechsel - Quick Reference

Schnellübersicht für den Wechsel zwischen Development und Production.

## ⚡ Umgebungswechsel Commands

### Lokal (Dev) → Production

```bash
# 1. Development stoppen: Ctrl+C (in allen Terminals)

# 2. Development DB stoppen
npm run dev:db:stop

# 3. Production starten
npm run prod:local
```

**Voraussetzung**: `.env.production` mit echten JWT Secrets erstellen

### Production → Lokal (Dev)

```bash
# 1. Production stoppen
npm run docker:down

# 2. Development DB starten
npm run dev:db:start

# 3. Development Server starten
npm run dev
```

**Voraussetzung**: `config/env/development.env.example` als `.env` kopieren

---

## 📌 Umgebungen auf einen Blick

| Umgebung        | Backend              | Frontend                 | Datenbank          | Env File           |
| --------------- | -------------------- | ------------------------ | ------------------ | ------------------ |
| **Development** | Port 3000 (nx serve) | Port 4200 (nx serve)     | Port 5435 (Docker) | `config/env/development.env.example` |
| **Production**  | Port 3000 (Docker)   | Port 8080 (Docker/Nginx) | Render/Docker      | `.env.production`  |

## 🚀 Quick Start Commands

### Development (Empfohlen für lokale Arbeit)

```bash
# 1. Setup (einmalig)
cp config/env/development.env.example .env
npm install
npm run dev:db:start
npx prisma migrate dev --schema=./apps/backend/prisma/schema.prisma
npm run prisma:seed

# 2. Arbeiten
npm run dev              # Backend + Frontend gleichzeitig
# ODER separat:
npm run dev:backend      # Nur Backend (Port 3000)
npm run dev:frontend     # Nur Frontend (Port 4200)

# 3. Datenbank verwalten
npm run prisma:studio    # GUI für Datenbank
```

### Production Testing (Lokal mit Docker)

```bash
# 1. Setup (einmalig)
cp config/env/production.env.example .env.production
# JWT Secrets in .env.production eintragen

# 2. Testen
npm run prod:local       # Alles starten (interaktiv)
npm run docker:logs      # Logs anzeigen
npm run docker:down      # Stoppen
```

## 🔄 Umgebung wechseln

### Dev → Production

```bash
# Development stoppen
docker compose --project-directory . -f docker/docker-compose.dev.yml down

# Production starten
cp config/env/production.env.example .env.production  # Falls noch nicht vorhanden
npm run prod:local
```

### Production → Dev

```bash
# Production stoppen
npm run docker:down

# Development starten
cp config/env/development.env.example .env
npm run dev:db:start
npm run dev
```

## 📝 Wichtige Dateien

```
config/env/development.env.example          ← Development Config (Git tracked)
.env.production          ← Production Config (Git ignored, manuell erstellen)
config/env/production.env.example ← Production Template (Git tracked)

docker/docker-compose.dev.yml   ← Development Docker (nur Datenbank)
docker-compose.yml       ← Production Docker (komplette App)
```

## 🛠️ Alle NPM Scripts

```bash
# Development
npm run dev                    # Backend + Frontend parallel
npm run dev:backend           # Nur Backend
npm run dev:frontend          # Nur Frontend
npm run dev:db:start          # PostgreSQL starten
npm run dev:db:stop           # PostgreSQL stoppen

# Production Testing
npm run prod:local            # Docker Compose (interaktiv)
npm run prod:local:detached   # Docker Compose (im Hintergrund)

# Docker
npm run docker:build:backend  # Backend Image bauen
npm run docker:build:frontend # Frontend Image bauen
npm run docker:build:all      # Beide Images bauen
npm run docker:up             # Production Container starten
npm run docker:down           # Production Container stoppen
npm run docker:logs           # Logs anzeigen

# Prisma
npm run prisma:generate       # Prisma Client generieren
npm run prisma:migrate        # Migrations anwenden
npm run prisma:studio         # Datenbank GUI
npm run prisma:seed           # Datenbank mit Testdaten füllen

# Build & Test
npm run build                 # Production Build (Backend + Frontend)
npm run build:backend         # Backend bauen
npm run build:frontend        # Frontend bauen
npm run test                  # Tests ausführen
npm run lint                  # Code prüfen
npm run format                # Code formatieren
npm run validate              # Alles prüfen (vor Push)
```

## 🔐 Secrets generieren

```bash
# JWT Secret generieren (min. 32 Zeichen)
openssl rand -base64 32

# Oder mit Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📚 Weitere Dokumentation

- **Kompletter Guide**: [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)
- **Docker Setup**: [DOCKER_SETUP_ANLEITUNG.md](DOCKER_SETUP_ANLEITUNG.md)
- **Prisma Setup**: [PRISMA_SETUP_ANLEITUNG.md](../../../setup/PRISMA_SETUP_ANLEITUNG.md)
- **Deployment**: [../deployment/RENDER_DEPLOYMENT.md](../../../deployment/README.md)

## 🆘 Troubleshooting

### Port blockiert?

```bash
npx kill-port 3000    # Backend
npx kill-port 4200    # Frontend
npx kill-port 5435    # PostgreSQL
```

### Docker Probleme?

```bash
# Cache löschen
docker builder prune -a

# Neustart
docker-compose down -v
docker-compose up --build --force-recreate
```

### Prisma out of sync?

```bash
npm run prisma:generate
npx prisma migrate reset --schema=./apps/backend/prisma/schema.prisma
```
