# Environment-Vorlagen

Vorlagen werden versioniert; aktive Environment-Dateien liegen weiterhin im
Hauptverzeichnis und werden durch `.gitignore` geschützt.

Die folgenden Befehle gelten ab dem Hauptverzeichnis. Bestehende aktive Dateien
nicht überschreiben; nur die Vorlage für die gewünschte Umgebung kopieren.

| Vorlage | Verwendung | Kopieren, falls die Zieldatei noch nicht existiert |
| --- | --- | --- |
| `development.env.example` | Lokale Entwicklung mit PostgreSQL in Docker | `cp config/env/development.env.example .env` |
| `docker.env.example` | Konfiguration für den vollständigen Docker-Stack | `cp config/env/docker.env.example .env` |
| `production.env.example` | Produktionswerte für Render und Prisma Postgres | `cp config/env/production.env.example .env.production` |

In PowerShell kann anstelle von `cp` auch `Copy-Item` verwendet werden.
Platzhalter vor der Verwendung ersetzen. Die Vorlagen werden nicht automatisch
geladen. Render erhält die Produktionswerte über die Service-Einstellungen.

Die allgemeine `.env.example` bleibt als Einstieg im Hauptverzeichnis erhalten.
Die Backend-spezifische Vorlage liegt weiterhin bei `apps/backend/.env.example`.
