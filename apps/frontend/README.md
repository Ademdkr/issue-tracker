# Frontend

Angular-Anwendung mit Standalone-Komponenten und Angular Material.

```text
src/app/
  core/               Auth, Guards, Interceptors, Layout und zentrale Services
  features/
    auth/
    dashboard/
    projects/
      components/     Projekt- und Ticketlisten-Komponenten ohne tiefe Schachtelung
      project-detail/
    tickets/
  shared/components/  Featureübergreifende Komponenten
```

Featureübergreifend verwendete API-Services bleiben unter `core/services/`.
Es werden keine zusätzlichen Bibliotheken allein für die Ordnerstruktur angelegt.

Alle Befehle ab dem Hauptverzeichnis:

```sh
npm run dev:frontend
npm exec nx build frontend -- --configuration=production
```

Die native Entwicklung verwendet den Angular-Proxy auf Backend-Port 3000.
Docker und Render nutzen dasselbe `Dockerfile`; `BUILD_CONFIGURATION` wählt den
Angular-Build, Standard ist `production`. `BACKEND_URL` wird zur Laufzeit für den
Nginx-Proxy verwendet. Beide Angular-Umgebungen nutzen relative `/api`-Adressen.

[Schnellstart](../../docs/QUICKSTART.md) ·
[Docker](../../docker/README.md) · [Deployment](../../docs/deployment/README.md)
