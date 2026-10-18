# Datenbankwerkzeuge

Schema und versionierte Migrationen liegen unter `apps/backend/prisma/`.
Hier liegen ausschließlich manuell ausgeführte Datenwerkzeuge. Alle Befehle
werden im Hauptverzeichnis ausgeführt und laden dessen `.env`; explizite
Prozessvariablen haben Vorrang. Zugangsdaten werden nicht ausgegeben.

| Befehl | Zweck |
| --- | --- |
| `npm run db:seed` | Standard-Demodaten über `seed.ts` anlegen; auch Einstieg für `prisma db seed` |
| `npm run db:seed-tickets` | Zusätzliche Beispieltickets anlegen |
| `npm run db:export` | Daten in die hier liegende `seed-data.json` exportieren; überschreibt den Snapshot |
| `npm run db:import` | Daten aus `seed-data.json` importieren; ersetzt vorhandene Anwendungsdaten |

`seed-data.json` ist ein historischer Demo-Snapshot, kein aktuelles
Produktionsbackup. Exporte können personenbezogene Daten und Passwort-Hashes
enthalten; echte Datenexporte nicht committen. Für vollständige PostgreSQL-
Backups einschließlich Migrationshistorie `pg_dump` verwenden.

**Import ist destruktiv:** Zielverbindung prüfen und vorher sichern. Import und
Seeds werden nicht im Produktionsdeployment ausgeführt. Der Seed ist ein eigener
Einstieg und verwendet nicht automatisch den JSON-Snapshot.

Client und Migrationen:

```sh
npm run prisma:generate -- --generator client
npm run prisma:migrate
npm run prisma:studio
```

Neue Schemaänderungen mit Prisma als Migration unter `apps/backend/prisma/`
anlegen. Produktiv ausschließlich `migrate deploy` verwenden. Details zum
Betrieb stehen in der [Deployment-Anleitung](../../docs/deployment/README.md).
