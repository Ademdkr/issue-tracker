# Schnellstart

Alle Befehle ab dem Hauptverzeichnis. Voraussetzungen: Node.js 20, npm und
laufendes Docker Desktop. Vorhandene `.env`-Dateien nicht überschreiben.

## Native Entwicklung mit Docker-Datenbank

```sh
npm ci --legacy-peer-deps
# Nur wenn .env noch nicht existiert:
cp config/env/development.env.example .env
npm run dev:db
npm run prisma:generate -- --generator client
npm run prisma:migrate
# Optional, ausschließlich für die gewünschte Entwicklungsdatenbank:
npm run db:seed
npm run dev
```

In PowerShell funktioniert `Copy-Item` anstelle von `cp`.

- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs
- Readiness: http://localhost:3000/api/health/ready
- PostgreSQL: localhost:5435

Für pgAdmin zusätzlich das Profil `tools` starten:

```sh
docker compose --project-directory . -f docker/docker-compose.dev.yml --profile tools up -d
```

## Vollständiger Docker-Stack

```sh
# Nur wenn .env noch nicht existiert:
cp config/env/docker.env.example .env
npm run docker:full
```

Frontend: http://localhost, Backend: http://localhost:3001/api.
Das Frontend verwendet den Development-Build, ausgeliefert durch Nginx.
Für Produktionsbuilds lokal: `docker compose up --build`.
Die Betriebsarten einzeln starten, da sie dieselben Host-Ports verwenden.

Bestehende Daten liegen in getrennten Volumes je Variante. Die Volumes beim
Wechsel erhalten; `down -v` löscht sie.

## Weiterführend

[Docker](../docker/README.md) · [Environment](../config/env/README.md) ·
[Datenbankwerkzeuge](../scripts/database/README.md) · [Deployment](deployment/README.md)
