# Docker-Konfigurationen

Alle Befehle werden im Hauptverzeichnis des Repositories ausgeführt.

`compose.services.yml` definiert die gemeinsamen Services. Die drei Einstiege
verwenden `extends` und überschreiben nur ihre Varianten: Container-/Volumenamen,
Development-Konfiguration und optionale Werkzeuge. Gemeinsame Einstellungen
werden ausschließlich in `compose.services.yml` gepflegt.

| Datei | Zweck | Start |
| --- | --- | --- |
| `../docker-compose.yml` | Vollständiger Stack mit Produktionsbuilds | `docker compose up --build` |
| `docker-compose.dev.yml` | PostgreSQL und pgAdmin für native Entwicklung | `npm run dev:db` |
| `docker-compose.full.yml` | Vollständiger Stack mit Frontend-Development-Build | `npm run docker:full` |

Direkter Aufruf der zusätzlichen Konfigurationen:

```sh
docker compose --project-directory . -f docker/docker-compose.dev.yml up -d
docker compose --project-directory . -f docker/docker-compose.full.yml up --build
```

`--project-directory .` erhält das Hauptverzeichnis als Basis für `.env`,
Build-Kontexte und den Compose-Projektnamen. Den Parameter auch bei `down`,
`logs` und `build` verwenden. So bleiben die bestehenden Datenvolumes zugeordnet.
Die Varianten belegen dieselben Host-Ports und werden einzeln betrieben.

Die Standarddatei bleibt im Hauptverzeichnis, damit `docker compose` sie weiterhin
automatisch findet. Dockerfiles, Nginx-Konfiguration und Startskripte liegen bei
der jeweiligen Anwendung unter `apps/`.

Das Frontend verwendet ein einziges Dockerfile. Standard ist
`BUILD_CONFIGURATION=production`; die Full-Variante setzt das Build-Argument auf
`development`. Der interne Proxy wird in beiden Varianten durch `BACKEND_URL`
konfiguriert. Das Profil `tools` aktiviert pgAdmin in der Dev- und Full-Variante.
