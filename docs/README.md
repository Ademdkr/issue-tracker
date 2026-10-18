# Dokumentation

## Einstieg

- [Schnellstart](QUICKSTART.md): Installation und lokaler Start
- [Entwicklungsumgebungen](DEVELOPMENT_ENVIRONMENTS.md): native Entwicklung und Docker
- [Docker-Konfigurationen](../docker/README.md): gemeinsame Services und Varianten
- [Environment-Vorlagen](../config/env/README.md): Zuordnung der Konfigurationsdateien
- [Datenbankwerkzeuge](../scripts/database/README.md): Seeds, Export und Import
- [Deployment und CI/CD](deployment/README.md): Render mit Prisma Postgres

## Architektur und Entwicklung

- [Systemarchitektur](architecture/architecture-diagram.md)
- [Datenbankmodell](architecture/database-erd.md), aus dem Prisma-Schema generiert
- [Backend](../apps/backend/README.md) und [Frontend](../apps/frontend/README.md)
- [Backend-Architektur](guides/backend/architecture.md)
- [Berechtigungen](guides/backend/auth/authentication-guards.md)
- [Policy-System](guides/backend/policy/policy-handler-pattern.md)
- [Frontend-Struktur](guides/frontend/folder-structure.md)
- [Gemeinsame API-Verträge](../libs/shared-types/README.md)

Die Feature-Guides unter `guides/` erläutern einzelne Implementierungen.
Dateipfade und Beispiele aus älteren Guides können vom aktuellen Quellcode
abweichen; für Einrichtung und Betrieb gelten die oben verlinkten Einstiege.

## Werkzeuge

- [Nx](setup/nx/SETUP_ANLEITUNG.md)
- [Prisma](setup/PRISMA_SETUP_ANLEITUNG.md)
- [NestJS CLI](setup/NESTJS_CLI_ANLEITUNG.md)
- [Angular CLI](setup/angular/angular-cli-commands.md)
- [Angular Material](setup/angular/angular-material-setup.md)
- [GitHub](setup/github/GITHUB_ANLEITUNG.md)

## Projekt

- [Changelog](project/CHANGELOG.md)
- [Contributing](../.github/CONTRIBUTING.md)
- [Security](../.github/SECURITY.md)
- [Historische Berichte](archive/README.md)

Neue Betriebsanleitungen werden in den bestehenden Einstiegen gepflegt.
Abgeschlossene Zustandsberichte und überholte Deployment-Anleitungen gehören ins
Archiv und erhalten einen Hinweis auf die aktuelle Anleitung.
