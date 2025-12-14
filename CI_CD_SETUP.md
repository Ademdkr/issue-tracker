# CI/CD Pipeline Setup

Diese Dokumentation beschreibt das Setup und die Verwendung der CI/CD-Pipelines für das Issue Tracker Projekt.

## Übersicht

Das Projekt verwendet GitHub Actions für Continuous Integration und Continuous Deployment mit folgenden Workflows:

### 1. CI Pipeline (`ci.yml`)

**Auslöser:**

- Push auf `main` oder `develop`
- Pull Requests zu `main` oder `develop`

**Jobs:**

1. **Setup** - Installiert Dependencies und richtet Caching ein
2. **Lint** - ESLint auf betroffene Projekte
3. **Test** - Unit Tests mit Coverage-Reports
4. **Build** - Baut betroffene Projekte
5. **E2E** - End-to-End Tests
6. **TypeCheck** - TypeScript Compiler Check
7. **Security** - npm Security Audit

**Besonderheiten:**

- Nutzt `nx affected` für optimierte Builds (nur geänderte Projekte)
- Parallele Ausführung von Jobs für schnellere Pipelines
- Automatisches Caching von `node_modules`
- Coverage-Reports werden zu Codecov hochgeladen

### 2. Staging Deployment (`deploy-staging.yml`)

**Auslöser:**

- Push auf `develop` Branch
- Manueller Trigger über `workflow_dispatch`

**Schritte:**

- Build für Staging-Umgebung
- Datenbank-Migrationen
- Deployment zu Staging-Server
- Health Checks

### 3. Production Deployment (`deploy-production.yml`)

**Auslöser:**

- Push auf `main` Branch
- Tags mit Pattern `v*.*.*`
- Manueller Trigger über `workflow_dispatch`

**Schritte:**

- Vollständige Test-Suite
- Build für Produktion
- Datenbank-Backup vor Migrationen
- Deployment zu Production-Server
- Health Checks
- Rollback bei Fehlern

### 4. Dependency Review (`dependency-review.yml`)

**Auslöser:**

- Pull Requests zu `main` oder `develop`

**Prüfungen:**

- Neue Dependencies auf Sicherheitslücken
- Lizenz-Compliance
- Breaking Changes in Dependencies

### 5. CodeQL Security Analysis (`codeql-analysis.yml`)

**Auslöser:**

- Push auf `main` oder `develop`
- Pull Requests
- Wöchentlich (Montags 6:00 UTC)

**Analyse:**

- Sicherheitslücken im Code
- Code-Qualität
- Best Practice Violations

## Einrichtung

### 1. GitHub Secrets konfigurieren

Folgende Secrets müssen in den GitHub Repository Settings hinzugefügt werden:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Erforderliche Secrets:**

#### Nx Cloud (Optional, aber empfohlen)

```
NX_CLOUD_ACCESS_TOKEN
```

Nx Cloud beschleunigt Builds durch Distributed Caching.
Erhalten Sie einen Token unter: https://nx.app/

#### Staging Environment

```
STAGING_API_URL          # z.B. https://api-staging.example.com
STAGING_DATABASE_URL     # PostgreSQL Connection String
```

#### Production Environment

```
PRODUCTION_API_URL       # z.B. https://api.example.com
PRODUCTION_DATABASE_URL  # PostgreSQL Connection String
```

#### Optional (für erweiterte Features)

```
CODECOV_TOKEN           # Für Coverage Reports
SLACK_WEBHOOK_URL       # Für Benachrichtigungen
DOCKER_USERNAME         # Für Container Registry
DOCKER_PASSWORD         # Für Container Registry
```

### 2. Branch Protection Rules

Empfohlene Branch Protection Rules für `main`:

```
Settings → Branches → Add rule
```

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - ci-success
  - lint
  - test
  - build
  - typecheck
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Include administrators (optional)

### 3. Environments konfigurieren

```
Settings → Environments → New environment
```

**Staging Environment:**

- Name: `staging`
- URL: `https://staging.issue-tracker.example.com`
- Deployment branches: `develop`

**Production Environment:**

- Name: `production`
- URL: `https://issue-tracker.example.com`
- Deployment branches: `main`
- ✅ Required reviewers: [Ihre Namen]
- ✅ Wait timer: 5 minutes

## Nx Cloud Setup (Optional)

Nx Cloud bietet deutliche Performance-Verbesserungen durch:

- Distributed Computation Caching
- Distributed Task Execution
- Workspace Analytics

### Einrichtung:

1. Account erstellen: https://nx.app/
2. Workspace verbinden:
   ```bash
   npx nx connect-to-nx-cloud
   ```
3. Access Token als GitHub Secret hinzufügen

## Lokales Testing der CI-Pipeline

### Mit Act (GitHub Actions lokal ausführen)

```bash
# Act installieren
npm install -g act

# CI Workflow lokal ausführen
act -j lint
act -j test
act -j build
```

### Manuelle Checks vor Push

```bash
# Linting
npx nx affected -t lint

# Tests
npx nx affected -t test

# Build
npx nx affected -t build

# Alle Checks
npm run ci:check
```

## Workflow-Überwachung

### GitHub Actions Tab

Alle Workflow-Runs sind sichtbar unter:

```
Repository → Actions
```

### Benachrichtigungen

- Email-Benachrichtigungen bei fehlgeschlagenen Workflows
- Optional: Slack/Discord-Integration

## Troubleshooting

### Pipeline schlägt fehl: "Cannot find module"

**Lösung:** Cache löschen und neu bauen

```bash
npx nx reset
```

### E2E Tests timeout

**Lösung:** Timeout in `project.json` erhöhen

```json
"e2e": {
  "options": {
    "timeout": 120000
  }
}
```

### Deployment schlägt fehl

**Lösung:** Secrets überprüfen und Logs checken

```
Actions → [Failed Workflow] → [Job] → View logs
```

## Best Practices

1. **Kleine, fokussierte Commits** - Erleichtert Code Review und Rollbacks
2. **Feature Branches** - Entwickle in separaten Branches
3. **Tests schreiben** - Stelle sicher, dass Tests existieren
4. **PR Template nutzen** - Fülle alle Abschnitte aus
5. **CI grün halten** - Fixe failing Tests sofort
6. **Dependencies aktuell halten** - Regelmäßige Updates
7. **Security Alerts beachten** - Reagiere auf Dependabot Alerts

## Monitoring und Metriken

### Pipeline-Metriken

- Durchschnittliche Build-Zeit
- Test-Coverage
- Erfolgsrate der Deployments

### Zugriff auf Metriken:

```
Repository → Insights → Actions
```

## Erweiterungen

### Weitere Workflows hinzufügen

Workflow-Dateien werden in `.github/workflows/` gespeichert:

```yaml
# .github/workflows/custom-workflow.yml
name: Custom Workflow
on:
  push:
    branches: [main]
jobs:
  custom-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Custom Step
        run: echo "Custom action"
```

### Integration mit anderen Services

- **Sentry**: Error Tracking
- **Datadog**: Application Monitoring
- **Lighthouse CI**: Performance Monitoring
- **SonarQube**: Code Quality

## Support

Bei Problemen oder Fragen:

1. Check GitHub Actions Logs
2. Konsultiere diese Dokumentation
3. Öffne ein Issue im Repository

## Updates

Diese CI/CD-Pipeline sollte regelmäßig aktualisiert werden:

- GitHub Actions Versionen
- Node.js Version
- Dependencies
- Security Policies

Letzte Aktualisierung: Dezember 2025
