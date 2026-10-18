# 🚀 Issue Tracker - Entwicklungsumgebungen

Dieses Projekt unterstützt **3 verschiedene Entwicklungsszenarien**:

## 📋 Übersicht der Umgebungen

| Umgebung                | Use Case               | Backend         | Frontend         | Database          | Hot-Reload |
| ----------------------- | ---------------------- | --------------- | ---------------- | ----------------- | ---------- |
| **Lokal (Native)**      | Tägliche Entwicklung   | Native (NestJS) | Native (Angular) | Docker PostgreSQL | ✅ Ja      |
| **Full-Stack Docker**   | Testing vor Deployment | Docker          | Docker           | Docker PostgreSQL | ❌ Nein    |
| **Production (Render)** | Live Deployment        | Render          | Render           | Render PostgreSQL | ❌ Nein    |

---

## 1️⃣ Lokale Entwicklung (Empfohlen)

**Schnellste Option mit Hot-Reload für Backend & Frontend**

### Setup

```bash
# 1. Postgres & pgAdmin starten
docker-compose -f docker-compose.dev.yml up -d

# 2. Environment-Variablen kopieren
cp .env.local .env

# 3. Dependencies installieren
npm install

# 4. Prisma Client generieren
npx prisma generate --schema=apps/backend/prisma/schema.prisma

# 5. Datenbank migrieren
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma

# 6. Datenbank mit Test-Daten befüllen (optional)
cd apps/backend
npx ts-node prisma/seed.ts
cd ../..

# 7. Backend starten (Terminal 1)
npx nx serve backend

# 8. Frontend starten (Terminal 2)
npx nx serve frontend
```

### Zugriff

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5435
- **pgAdmin**: http://localhost:5050 (optional, mit --profile tools)

### Environment-Variablen

Datei: `.env.local` (wird zu `.env` kopiert)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/issue_tracker_db
JWT_SECRET=dev-secret-key-only-for-local-development-min-32-chars-long
JWT_REFRESH_SECRET=dev-refresh-secret-only-for-local-development-min-32-chars
FRONTEND_URL=http://localhost:4200
CORS_ORIGINS=http://localhost:4200,http://localhost:4201
```

### Vorteile

- ✅ **Schnellstes Hot-Reload** (Backend & Frontend)
- ✅ **Beste Developer Experience**
- ✅ **Voller Debugging-Support**
- ✅ **IDE-Integration**

---

## 2️⃣ Full-Stack Docker

**Test-Umgebung für Production-ähnliches Setup**

### Setup

```bash
# 1. Nur bei einer neuen Installation: Environment-Datei anlegen.
# Bestehende .env und Datenbank-Zugangsdaten beibehalten!
test -f .env || cp .env.example .env

# 2. Alle Services starten
docker-compose -f docker-compose.full.yml up --build

# Optional: Mit pgAdmin
docker-compose -f docker-compose.full.yml --profile tools up --build
```

### Zugriff

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5435
- **pgAdmin**: http://localhost:5050 (mit --profile tools)

Das Backend verwendet im Container weiterhin Port 3000. Der Host-Port ist
standardmäßig 3001, damit andere lokale Anwendungen auf Port 3000 weiterlaufen
können. `BACKEND_HOST_PORT` und `FRONTEND_HOST_PORT` können in `.env` angepasst
werden. Der Frontend-Proxy verwendet immer `http://backend:3000` im Docker-Netz.

Compose liest hier standardmäßig `.env`. Eine abweichende `.env.docker` wird nur
mit `--env-file .env.docker` verwendet. Bei vorhandenen PostgreSQL-Volumes müssen
die Zugangsdaten zu dem bereits initialisierten Datenbestand passen; geänderte
Environment-Werte ändern dessen Datenbankpasswort nicht automatisch.

Bei `port is already allocated` zuerst die Belegung mit `docker ps` prüfen und
den Host-Port konfigurieren. Vorhandene Datenbank-Volumes deshalb nicht löschen.

Der Frontend-Health-Check verwendet `127.0.0.1`, weil Nginx auf IPv4 lauscht.
BusyBox-`wget` kann `localhost` stattdessen als IPv6-Adresse `::1` auflösen und
den Container fälschlich als ungesund markieren.

### Environment-Variablen

Datei: `.env` (aus `.env.example` kopieren)

```env
POSTGRES_DB=issue_tracker_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ChangeMeInProduction123!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

### Vorteile

- ✅ **Production-ähnliche Umgebung**
- ✅ **Isolierte Container**
- ✅ **Testing von Docker Builds**
- ❌ **Kein Hot-Reload**

### Services stoppen

```bash
# Stoppen und Container entfernen
docker-compose -f docker-compose.full.yml down

# Mit Volume-Löschung (ACHTUNG: Löscht alle Daten!)
docker-compose -f docker-compose.full.yml down -v
```

---

## 3️⃣ Production Deployment (Render.com)

**Live-Deployment über Render.com**

### Setup

Deployment erfolgt automatisch über GitHub Actions bei Push auf `master`:

1. Code auf `master` Branch pushen
2. GitHub Action `deploy-production.yml` startet automatisch
3. Render.com baut und deployed automatisch über `render.yaml`

### Zugriff

- **Frontend**: https://issue-tracker.ademdokur.dev
- **Backend API**: https://issue-tracker-backend-23d7.onrender.com/api

### Environment-Variablen

Werden im **Render Dashboard** gesetzt:

```env
NODE_ENV=production
DATABASE_URL=<von Render generiert>
JWT_SECRET=<sicheres Secret, min. 32 Zeichen>
JWT_REFRESH_SECRET=<sicheres Secret>
FRONTEND_URL=https://issue-tracker.ademdokur.dev
CORS_ORIGINS=https://issue-tracker.ademdokur.dev
```

---

## 🔧 Prisma Befehle

```bash
# Prisma Studio (Datenbank GUI)
npx prisma studio --schema=apps/backend/prisma/schema.prisma

# Migration erstellen
npx prisma migrate dev --name your-migration-name --schema=apps/backend/prisma/schema.prisma

# Produktions-Migration
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

# Datenbank zurücksetzen (ACHTUNG: Löscht alle Daten!)
npx prisma migrate reset --schema=apps/backend/prisma/schema.prisma

# Prisma Client neu generieren
npx prisma generate --schema=apps/backend/prisma/schema.prisma
```

---

## 🐛 Troubleshooting

### Backend startet nicht

```bash
# Prüfe ob PostgreSQL läuft
docker ps

# Prüfe DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Prisma Client neu generieren
npx prisma generate --schema=apps/backend/prisma/schema.prisma
```

### Frontend kann Backend nicht erreichen

**Lokale Entwicklung:**

- Backend muss auf `http://localhost:3000` laufen
- `environment.ts` nutzt `apiUrl: 'http://localhost:3000/api'`

**Full-Stack Docker:**

- Frontend läuft im Browser (nicht im Container!)
- Browser greift auf `http://localhost:3000` zu (nicht `http://backend:3000`)
- `environment.prod.ts` wird verwendet

### Docker Build fehlschlägt

```bash
# Cache löschen und neu bauen
docker-compose -f docker-compose.full.yml build --no-cache

# Logs anzeigen
docker-compose -f docker-compose.full.yml logs backend
docker-compose -f docker-compose.full.yml logs frontend
```

### Port already in use

```bash
# Windows: Port freigeben
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Oder anderen Port verwenden
PORT=3001 npx nx serve backend
```

---

## 📚 Weitere Dokumentation

- [Render Deployment](./deployment/RENDER_DEPLOYMENT.md)
- [CI/CD Workflows](./deployment/CI_CD_WORKFLOWS.md)
- [Environment Variables](./deployment/02-environment-variables.md)
- [Docker Setup](./deployment/03-dockerfile-optimization.md)
