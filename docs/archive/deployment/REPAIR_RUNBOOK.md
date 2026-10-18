> Historisches Dokument. Maßgeblich sind [Deployment](../../deployment/README.md) und [Schnellstart](../../QUICKSTART.md). Beispiele können veraltet sein.

# Deployment reparieren und vorhandene Daten erhalten

Stand: 18. Oktober 2026. Die Änderungen im Repository reparieren Health Checks,
Proxy und Deploymentablauf. Die Live-Reparatur braucht zusätzlich die korrekte
Verbindung zur bestehenden Datenbank und ein Deployment dieser Änderungen.

## Datenbank zuerst prüfen

Der zuletzt geprüfte Backend-Health-Check referenzierte einen nicht erreichbaren
Render-Datenbankhost. Im vom Benutzer gezeigten Prisma-Dashboard existiert schon
länger eine separate Datenbank `issue-tracker-db`. Ihr Inhalt und ihre Verbindung
zum bisherigen Live-Bestand sind noch nicht verifiziert.

1. In Prisma die Tabellen und Datensätze der bestehenden Datenbank prüfen,
   insbesondere `users`, `projects` und `tickets`.
2. Vor Datenbankänderungen einen Export/Backup des gefundenen Bestands erstellen.
3. Die PostgreSQL-Verbindung für das bestehende Prisma-5-Backend prüfen. Eine
   direkte `postgresql://`-Verbindung ist von einer Prisma-Accelerate-URL zu
   unterscheiden; eine `prisma+postgres://`-URL nicht ungeprüft einsetzen.
4. Im Render-Backend unter Environment `DATABASE_URL` auf die geprüfte Verbindung
   setzen. Zugangsdaten ausschließlich dort speichern, nicht in Git oder Chat.
5. Den Prisma-Migrationsstatus vor dem ersten Start mit dem reparierten Image
   prüfen. Existieren Tabellen ohne passende `_prisma_migrations`-Historie, zuerst
   das Schema vergleichen und eine korrekte Baseline festlegen. `migrate deploy`
   soll bei einem solchen Konflikt abbrechen; niemals mit einem Reset umgehen.

Es wird keine neue Datenbank durch `render.yaml` angelegt. Die Datei verwendet
für `DATABASE_URL` bewusst `sync: false`. Bei einem bereits bestehenden Render-
Service muss der Wert im Dashboard gesetzt werden; ein Blueprint-Sync ändert
dieses Secret nicht.

`prisma migrate reset`, `db push --accept-data-loss` und
`scripts/database/import-seed-data.ts` hier **nicht ausführen**. Das vorhandene
Importskript löscht bestehende Tabelleninhalte vor dem Import.

Als mögliche Rückfalloption liegt `scripts/database/seed-data.json` vor:
Export vom **27. Dezember 2025, 07:19 UTC**, mit 4 Benutzern, 8 Projekten,
5 Projektmitgliedschaften, 5 Labels, 86 Tickets, 3 Ticket-Label-Zuordnungen,
6 Kommentaren und 42 Aktivitäten. Das ist ein älterer Snapshot, kein Nachweis
des letzten Produktionsbestands. Er wurde weder verändert noch importiert.

## Änderungen und Render-Einstellungen

- Backend: Das Startskript führt `prisma migrate deploy` aus und startet Node
  nur bei Erfolg. Der Prisma Client wird beim Image-Build erzeugt und in das
  Laufzeitimage kopiert; beim Start werden keine Pakete installiert.
- Backend: `/api/health` und `/api/health/ready` liefern bei Datenbankausfall HTTP
  503 ohne interne Verbindungsdetails. Health-Endpunkte sind vom Rate Limiting
  ausgenommen. Readiness enthält den `RENDER_GIT_COMMIT` zur Releaseprüfung.
- Frontend: Angular nutzt `/api`, sowohl im Produktionsbuild als auch über den
  lokalen Angular-Dev-Proxy. Nginx verwendet `BACKEND_URL`, TLS-SNI und erneute
  DNS-Auflösung. Die Security-Header gelten auch für HTML und statische Dateien;
  vorhandene Google Fonts bleiben erlaubt.
- Frontend: `BACKEND_URL` auf die tatsächliche öffentliche Backend-Adresse
  setzen, ohne `/api` oder weitere Pfade. Standard ist
  `https://issue-tracker-backend-23d7.onrender.com`. Lokal kann der Compose-
  Service mit `http://backend:3000` verwendet werden.
- Frontend: `/deployment.json` meldet den laufenden Frontend-Commit ohne Caching.
- Render: Backend-Health-Check `/api/health/ready`, Frontend-Health-Check `/health`.
  Eventuelle alte Docker-Command-Overrides entfernen, damit die Docker-CMDs
  tatsächlich die reparierten Startskripte verwenden.
- Render: Auto-Deploy für beide Dienste ausschalten, wenn GitHub CD den Release
  steuert. `render.yaml` enthält diese Einstellungen; bei manuell angelegten
  Diensten die bestehenden Einstellungen gezielt im Dashboard abgleichen.

## Release und Abnahme

GitHub benötigt die bestehenden Secrets `RENDER_DEPLOY_HOOK_BACKEND` und
`RENDER_DEPLOY_HOOK_FRONTEND`. CD läuft nur auf `master`, prüft Lint, die
Deployment-Regressionstests und beide Builds und übergibt den geprüften Commit
an die Render-Hooks. Parallel laufende Produktionsworkflows werden serialisiert.

Zuerst wird das Backend ausgeliefert und auf Datenbank-Readiness **mit dem
erwarteten Commit** gewartet. Dann wird das Frontend ausgeliefert. Erfolg setzt
den passenden Frontend-Commit, funktionierende Readiness durch den Frontend-
Proxy und eine erreichbare HTML-Seite voraus. Fehlerhafte Hook-Antworten,
ausbleibende Readiness und alte Commits führen zum Workflowfehler. Die Prüfung
verfolgt die ausgelieferten Endpunkte, nicht interne Render-Deployzustände.

Nach Deployment prüfen:

```text
GET https://issue-tracker-backend-23d7.onrender.com/api/health/ready
    200, ready=true, commit=<ausgelieferter SHA>
GET https://issue-tracker.ademdokur.dev/deployment.json
    200, commit=<derselbe SHA>
GET https://issue-tracker.ademdokur.dev/api/health/ready
    200, ready=true, commit=<derselbe SHA>
```

Anschließend Anmeldung und Anzeige der vorhandenen Projekte/Tickets prüfen.
Ein erfolgreicher Health Check belegt die Datenbankverbindung, aber noch keine
vollständige fachliche Funktionsprüfung oder Vollständigkeit der Daten.

Die Reparatur ändert keine Render-Tarife. Ein Free-Webservice kann weiterhin in
den Ruhemodus wechseln. Wiederherstellung und Tarifwechsel sind getrennte
Entscheidungen.

## Durchgeführte lokale Prüfungen

### Prisma-Übertragung am 18. Oktober 2026

Die bestehende Prisma-Postgres-Datenbank wurde über eine lokal gespeicherte,
ignorierte `.env.production` geprüft. Sie war über PostgreSQL 17.2 erreichbar und
enthielt keine Anwendungstabellen. Der lokale Bestand wurde mit PostgreSQL-17-
Werkzeugen gesichert und über den direkten Anschluss atomar importiert
(`pg_restore --single-transaction --exit-on-error --no-owner --no-privileges`).
Lokale Anwendungsschreibzugriffe waren währenddessen durch Stoppen von Backend
und Frontend unterbrochen; beide Container wurden danach wieder gestartet.

Übertragen und gegen die Quelle geprüft: 4 Benutzer, 5 Projekte, 4 Mitgliedschaften,
2 Labels, 53 Tickets und 2 Migrationshistorieneinträge. Ticket-Labels, Kommentare,
Aktivitäten und Refresh-Tokens waren leer. Zeilenanzahlen und Prüfsummen aller
zehn Tabellen stimmen überein. Das neue vollständige Backup liegt unter
`.backups/issue-tracker-prisma-transfer-2026-10-18T14-03-47-846Z.dump`.

Der bestehende Prisma Client 5.22.0 wurde über die Pool-Verbindung erfolgreich
geprüft, einschließlich der bestehenden Demo-Passworthashes. `.env.production`
enthält jetzt `DATABASE_URL` für den Pool und `DIRECT_URL` für Migrationen.
Beide Werte bleiben außerhalb von Git.

**Noch in Render zu setzen:** Beim bestehenden `issue-tracker-backend` unter
Environment die gleichnamigen Werte aus `.env.production` übernehmen. Danach
die vorbereiteten Codeänderungen deployen und Anmeldung sowie Datensätze prüfen.
Die Übertragung allein ändert die Verbindung des laufenden Render-Backends nicht.

Die Datenbank-Health-Checks teilen sich pro Backend-Prozess eine Prüfung pro
60 Sekunden, auch bei Fehlern und gleichzeitig eintreffenden Probes. Das sind
bei durchgehendem Betrieb etwa 43.200 Prüfqueries pro 30 Tage und Prozess.
Der Status kann dadurch bis zu 60 Sekunden verzögert einen Ausfall oder die
Wiederherstellung melden. Der Migrationsstart verwendet `DIRECT_URL`, mit
`DATABASE_URL` als Rückfallwert für die lokale Compose-Umgebung.

- Backend- und Frontend-Produktionsbuild über Nx erfolgreich.
- Backend-/Frontend-Lint ohne Fehler; vorhandene Warnungen bleiben bestehen.
- Sechs Regressionstests über `nx run backend:deployment-check` erfolgreich,
  einschließlich gemeinsamer Health-Check-Abfragen, Ablauf und Wiederherstellung.
- Beide Produktions-Dockerfiles erfolgreich gebaut.
- Render-Blueprint gegen das öffentliche JSON-Schema validiert.
- Nginx-Konfiguration im nicht privilegierten Container erfolgreich geprüft;
  HTML und Release-Marker liefern die vorgesehenen Security-Header.
- Reparierter HTTPS-Proxy erreicht das öffentliche Backend. Dessen JSON meldet
  weiterhin die fehlende Verbindung zum alten Render-Datenbankhost.
- Isolierter Container-Test mit PostgreSQL 16 im temporären Speicher: beide
  Migrationen angewendet, Testdatensatz nach Backend-Neustart erhalten,
  Frontend-Proxy und Commit-Marker korrekt. Nach Abschalten der Testdatenbank
  liefert Readiness über den Proxy HTTP 503; Liveness bleibt erreichbar.
- Testcontainer und ihr Netzwerk anschließend entfernt. Keine produktive
  Datenbank verwendet und keine Migration auf Produktion ausgeführt.

Der Live-Release und die Anbindung der nun befüllten Prisma-Datenbank im
Render-Backend stehen noch aus. Die erfolgreichen Prüfungen sind kein Nachweis
einer bereits reparierten Produktion.
