# Backend

NestJS-API mit Prisma/PostgreSQL. Einstieg: `src/main.ts`, Wurzelmodul:
`src/app/core/app.module.ts`.

Die fachlichen Module liegen unter `src/app/`: Auth, Benutzer, Projekte, Tickets,
Kommentare, Labels, Ticket-Aktivitäten und Dashboard. `database/` stellt Prisma
bereit, `health/` enthält Liveness und Datenbank-Readiness.

- `prisma/schema.prisma`: Datenbankmodell und Client-Generator
- `prisma/migrations/`: versionierte Schemaänderungen
- `../../scripts/database/`: Seed-, Export- und Importwerkzeuge
- `Dockerfile` und `start.sh`: Produktionsbuild und Start mit Migrationen

Alle Befehle ab dem Hauptverzeichnis:

```sh
npm run dev:backend
npm exec nx build backend -- --configuration=production
npm exec nx run backend:deployment-check
```

Lokale API: http://localhost:3000/api, Swagger: http://localhost:3000/api/docs.
Health: `/api/health`, `/api/health/ready`, `/api/health/live`.

[Schnellstart](../../docs/QUICKSTART.md) ·
[Datenbankwerkzeuge](../../scripts/database/README.md) ·
[Deployment](../../docs/deployment/README.md)
