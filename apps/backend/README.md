# Backend - Issue Tracker API

Enterprise-grade REST API für das Issue Tracker System mit NestJS, Prisma und PostgreSQL.

## 🚀 Quick Start

### Voraussetzungen

- Node.js 20.x oder höher
- PostgreSQL 14+ (läuft via Docker Compose)
- npm oder yarn

### 1. Installation

```bash
# Dependencies installieren (im Root-Verzeichnis)
npm install

# Prisma Client generieren
npx prisma generate --schema=apps/backend/prisma/schema.prisma
```

### 2. Environment Setup

Erstelle `.env` Datei in `apps/backend/`:

```env
# Database
DATABASE_URL="postgresql://issue_tracker_user:secure_password@localhost:5432/issue_tracker"

# JWT Secret (mindestens 32 Zeichen für Production!)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (für CORS)
FRONTEND_URL="http://localhost:4200"
```

### 3. Datenbank Setup

```bash
# PostgreSQL via Docker starten
docker-compose up -d postgres

# Migrationen ausführen
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma

# Seed-Daten laden (optional)
npx tsx apps/backend/prisma/seed.ts
```

### 4. Backend starten

```bash
# Development Server mit Hot-Reload
npm run dev:backend

# Oder via Nx
npx nx serve backend
```

Server läuft auf: **http://localhost:3000**

## 📚 API-Dokumentation

Nach dem Start ist die **Swagger UI** verfügbar:

```
http://localhost:3000/api/docs
```

### Features der API-Docs:

- ✅ Interaktive API-Exploration
- ✅ Request/Response Schemas
- ✅ JWT-Authentication Testing
- ✅ Try-it-out Funktionalität

### Authentifizierung in Swagger:

1. Login-Endpoint testen (`POST /api/auth/login`)
2. `access_token` aus Response kopieren
3. Auf "Authorize" Button klicken
4. Token einfügen: `Bearer <your-token>`
5. Geschützte Endpoints testen

## 🏗️ Projekt-Struktur

```
apps/backend/
├── src/
│   ├── app/
│   │   ├── auth/              # Authentifizierung & JWT
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── policies/
│   │   │   └── decorators/
│   │   ├── users/             # Benutzerverwaltung
│   │   ├── projects/          # Projektverwaltung
│   │   ├── tickets/           # Ticket-Management
│   │   ├── comments/          # Kommentarsystem
│   │   ├── labels/            # Label-Verwaltung
│   │   ├── ticket-activities/ # Activity-Tracking
│   │   ├── dashboard/         # Statistiken
│   │   ├── health/            # Health Checks
│   │   ├── database/          # Prisma Service
│   │   └── core/              # App Module
│   └── main.ts                # Bootstrap & Swagger
├── prisma/
│   ├── schema.prisma          # DB-Schema
│   ├── migrations/            # Migration History
│   ├── seed.ts                # Seed-Daten
│   └── logger.ts              # CLI Logger Utility
├── Dockerfile                 # Production Container
└── README.md                  # Diese Datei
```

## 🔐 Authentifizierung

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

### Geschützte Endpoints

```bash
curl -X GET http://localhost:3000/api/tickets \
  -H "Authorization: Bearer <your-access-token>"
```

## 🎭 Rollen & Berechtigungen

| Rolle         | Rechte                                                     |
| ------------- | ---------------------------------------------------------- |
| **REPORTER**  | Tickets erstellen, eigene bearbeiten, kommentieren         |
| **DEVELOPER** | + Priorität setzen, selbst zuweisen, Status ändern         |
| **MANAGER**   | + Anderen zuweisen, Mitglieder verwalten, Labels verwalten |
| **ADMIN**     | Alle Rechte + User-Verwaltung                              |

## 🛠️ Entwicklung

### Verfügbare Scripts

```bash
# Development Server
npm run dev:backend

# Production Build
npx nx build backend --configuration=production

# Tests
npx nx test backend

# Linting
npx nx lint backend

# Type Check
npx tsc --noEmit -p apps/backend/tsconfig.app.json
```

### Database Scripts

```bash
# Neue Migration erstellen
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma --name <migration-name>

# Prisma Studio (DB GUI)
npx prisma studio --schema=apps/backend/prisma/schema.prisma

# Seed-Daten neu laden
npx tsx apps/backend/prisma/seed.ts

# Datenbank zurücksetzen (⚠️ löscht alle Daten!)
npx prisma migrate reset --schema=apps/backend/prisma/schema.prisma
```

## 🧪 Testing

### Default Test Users (nach Seed)

```typescript
// Admin
{
  email: "admin@example.com",
  password: "Admin123!",
  role: "ADMIN"
}

// Manager
{
  email: "manager@example.com",
  password: "Manager123!",
  role: "MANAGER"
}

// Developer
{
  email: "developer@example.com",
  password: "Developer123!",
  role: "DEVELOPER"
}

// Reporter
{
  email: "reporter@example.com",
  password: "Reporter123!",
  role: "REPORTER"
}
```

## 📊 Health Check

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

## 🐳 Docker

### Development

```bash
# Starte alle Services (DB + Backend + Frontend)
docker-compose up

# Nur Backend
docker-compose up backend
```

### Production Build

```bash
# Backend Image bauen
docker build -f apps/backend/Dockerfile -t issue-tracker-backend .

# Container starten
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  issue-tracker-backend
```

## 🔧 Troubleshooting

### Prisma Client Fehler

```bash
# Prisma Client neu generieren
npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Nx Cache löschen
npx nx reset
```

### Database Connection Fehler

```bash
# PostgreSQL Status prüfen
docker-compose ps postgres

# Logs ansehen
docker-compose logs postgres

# PostgreSQL neu starten
docker-compose restart postgres
```

### Port bereits belegt

```bash
# Prozess auf Port 3000 finden
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Oder anderen Port in .env setzen
PORT=3001
```

## 📚 Weitere Dokumentation

- [Architecture Overview](../../docs/guides/backend/architecture.md)
- [API Documentation](http://localhost:3000/api/docs) (nach Start)
- [Auth Guards](../../docs/guides/backend/auth/authentication-guards.md)
- [Policy System](../../docs/guides/backend/policy/policy-system-implementation.md)
- [Prisma Setup](../../docs/setup/PRISMA_SETUP_ANLEITUNG.md)

## 🤝 Contributing

Siehe [CONTRIBUTING.md](../../CONTRIBUTING.md) für Development Guidelines.

## 📝 License

MIT - Siehe [LICENSE](../../LICENSE)
