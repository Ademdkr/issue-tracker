# Quick Start Guide

## 🚀 Schnellstart für neue Entwickler

### Option 1: Lokale Entwicklung (Empfohlen)

```bash
# 1. Repository klonen
git clone https://github.com/Ademdkr/issue-tracker.git
cd issue-tracker

# 2. PostgreSQL im Docker starten
docker-compose -f docker-compose.dev.yml up -d

# 3. Environment-Variablen kopieren
cp .env.local .env

# 4. Dependencies installieren
npm install

# 5. Prisma Setup
npx prisma generate --schema=apps/backend/prisma/schema.prisma
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma

# 6. Datenbank seeden (Test-Daten)
cd apps/backend && npx ts-node prisma/seed.ts && cd ../..

# 7. Backend starten (Terminal 1)
npx nx serve backend

# 8. Frontend starten (Terminal 2)
npx nx serve frontend
```

**Fertig!** 🎉
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

**Test-Accounts:**
```
Admin:     admin@example.com / Admin123!
Manager:   manager@example.com / Manager123!
Developer: developer@example.com / Developer123!
Reporter:  reporter@example.com / Reporter123!
```

---

### Option 2: Full-Stack Docker

```bash
# Alle Services in Docker
docker-compose -f docker-compose.full.yml up --build

# Zugriff:
# - Frontend: http://localhost
# - Backend: http://localhost:3000/api
```

---

## 📖 Weiterführende Dokumentation

- [Development Environments](./DEVELOPMENT_ENVIRONMENTS.md) - Detaillierte Setup-Anleitung
- [Backend Architecture](./guides/backend/architecture.md)
- [Frontend Structure](./guides/frontend/folder-structure.md)
