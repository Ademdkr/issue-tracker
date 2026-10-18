# Deployment: Render und Prisma Postgres

Frontend und Backend werden als Docker-Webservices auf Render betrieben.
Prisma Postgres stellt die bestehende PostgreSQL-Datenbank bereit. Der
[Render-Blueprint](../../render.yaml) provisioniert keine Datenbank.

## Konfiguration

Backend-Variablen in Render:

- `DATABASE_URL`: PostgreSQL-Verbindung über den Prisma-Pool
- `DIRECT_URL`: direkte PostgreSQL-Verbindung für Migrationen
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: bestehende Anwendungsschlüssel
- `NODE_ENV=production`, `PORT` entsprechend dem Render-Service
- `FRONTEND_URL`: öffentliche Frontend-Adresse

Die Vorlage liegt unter `config/env/production.env.example`. Verbindungswerte
werden im Render-Dashboard gesetzt. Lokale Environment-Dateien werden nicht ins
Image kopiert oder nach Render übertragen.

Frontend: `BACKEND_URL=https://issue-tracker-backend-23d7.onrender.com`, ohne
`/api`. Angular nutzt `/api`; Nginx leitet die Anfragen zum Backend weiter.

Der Backend-Start führt `prisma migrate deploy` aus und startet Node nur bei
Erfolg. Produktive Releases führen keine Seeds oder Datenimporte aus.

## CI/CD

Quellen: [CI](../../.github/workflows/ci.yml),
[CD](../../.github/workflows/cd.yml) und
[Deployment-Skript](../../scripts/deploy-render.mjs).

1. Pull Requests: Prisma Client generieren, Lint, Deployment-Regressionstests und
   Produktionsbuilds prüfen.
2. Push auf `master`: dieselben Prüfungen, anschließend Release über Render-Hooks.
3. Backend ausliefern und Readiness mit dem erwarteten Commit abwarten.
4. Frontend ausliefern und Frontend-Commit, API-Proxy und HTML-Antwort prüfen.

Benötigte GitHub-Secrets: `RENDER_DEPLOY_HOOK_BACKEND` und
`RENDER_DEPLOY_HOOK_FRONTEND`. Render-Auto-Deploy für beide Dienste deaktivieren,
wenn GitHub CD die Releases steuert. Bei bestehenden manuell angelegten Services
die Dashboard-Einstellungen mit `render.yaml` abgleichen.

## Abnahme und Fehlerdiagnose

```text
Backend: https://issue-tracker-backend-23d7.onrender.com/api/health/ready
Frontend: https://issue-tracker.ademdokur.dev/deployment.json
Proxy: https://issue-tracker.ademdokur.dev/api/health/ready
```

Alle Antworten müssen HTTP 200 und denselben Release-Commit melden; Readiness
zusätzlich `ready=true`. Danach Anmeldung und Projektanzeige prüfen.

Bei Fehlern Render-Build-/Startlogs und die Service-Variablen prüfen. Eine
Datenbankstörung ergibt HTTP 503. Datenbankprüfungen werden je Backend-Prozess
für 60 Sekunden zwischengespeichert. Render-Free-Webservices können weiterhin
in den Ruhemodus wechseln.

Bestehende Daten vor manuellen Datenbankarbeiten sichern. Schemaänderungen
gehören in `apps/backend/prisma/migrations/`; keine zweite manuelle Schemaquelle
pflegen. Die [Datenbankwerkzeuge](../../scripts/database/README.md) sind vom
Deployment getrennt.

Die [Reparaturberichte](../archive/README.md) dokumentieren frühere Zustände und
sind keine aktuellen Einrichtungsanleitungen.
