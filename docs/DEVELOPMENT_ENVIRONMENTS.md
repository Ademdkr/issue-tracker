# Entwicklungsumgebungen

| Betriebsart | Frontend | Backend | Datenbank | Einstieg |
| --- | --- | --- | --- | --- |
| Nativ | Angular auf 4200 | NestJS auf 3000 | Docker auf 5435 | [Schnellstart](QUICKSTART.md) |
| Docker, Development-Build | Nginx auf 80 | Docker auf 3001 | Docker auf 5435 | `npm run docker:full` |
| Docker, Produktionsbuild | Nginx auf 80 | Docker auf 3001 | Docker auf 5435 | `docker compose up --build` |
| Produktion | Render | Render | Prisma Postgres | [Deployment](deployment/README.md) |

Die Docker-Varianten teilen Service-Definitionen, besitzen aber weiterhin eigene
Container- und Volumenamen. Nie mehrere Varianten gleichzeitig auf denselben
Host-Ports starten. Die Full-Variante baut statische Development-Dateien und
bietet kein Hot Reload; dafür die native Betriebsart verwenden.

Angular verwendet in allen Betriebsarten `/api`. Der lokale Angular-Dev-Server
leitet an Port 3000 weiter. In Docker und Produktion übernimmt Nginx die
Weiterleitung an `BACKEND_URL`.

## Konfiguration

[Environment-Vorlagen](../config/env/README.md) dokumentieren die Zuordnung.
Vorlagen werden nicht automatisch geladen. Für lokale Befehle dient `.env` im
Hauptverzeichnis; Render erhält seine Werte über die Service-Einstellungen.
`.env.production` wird nicht automatisch durch Docker Compose ausgewählt.

## Container verwalten

```sh
# Full-Variante: Status und Logs
docker compose --project-directory . -f docker/docker-compose.full.yml ps
docker compose --project-directory . -f docker/docker-compose.full.yml logs backend
# Container beenden, Datenvolumes behalten
docker compose --project-directory . -f docker/docker-compose.full.yml down
```

Ports können im vollständigen Stack mit `BACKEND_HOST_PORT` und
`FRONTEND_HOST_PORT` konfiguriert werden. Native Entwicklung verwendet weiterhin
Backend-Port 3000. Details: [Docker-Konfigurationen](../docker/README.md).
