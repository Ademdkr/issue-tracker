# CI/CD Workflows - Issue Tracker

**Letzte Aktualisierung**: 30. Dezember 2025

---

## 📋 Übersicht

Das Projekt verwendet **2 GitHub Actions Workflows**:

1. **`ci.yml`** - Continuous Integration (Code Quality)
2. **`cd.yml`** - Continuous Deployment (Production)

---

## 🔄 CI - Continuous Integration

**Datei**: `.github/workflows/ci.yml`

### Trigger

- ✅ Pull Requests zu `master` oder `feature/**`
- ✅ Pushes zu `feature/**` Branches
- ✅ Manuell (workflow_dispatch)

### Was wird geprüft?

1. **Linting** - Code Quality & Style
2. **Backend Build** - TypeScript Compilation
3. **Frontend Build** - Angular Production Build

### Schritte

```yaml
1. Checkout Code
2. Setup Node.js 20
3. Install Dependencies (npm ci)
4. Lint Code (npm run lint:all)
5. Build Backend (nx build backend --production)
6. Build Frontend (nx build frontend --production)
```

### Dauer

⏱️ **~3-5 Minuten**

### Status

- ✅ Erfolgreich → Merge erlaubt
- ❌ Fehler → Fix benötigt

---

## 🚀 CD - Continuous Deployment

**Datei**: `.github/workflows/cd.yml`

### Trigger

- ✅ Push zu `master` Branch
- ✅ Manuell (workflow_dispatch)

### Was wird deployed?

1. **Backend** → `issue-tracker-backend-23d7.onrender.com`
2. **Frontend** → `issue-tracker.ademdokur.dev`

### Schritte

```yaml
1. Checkout Code
2. Setup Node.js 20
3. Install Dependencies
4. Generate Prisma Client
5. Build Backend (Production)
6. Build Frontend (Production)
7. Trigger Render Deployments (via Deploy Hooks)
8. Wait 300s for deployment
9. Health Check Backend
10. Health Check Frontend
```

### Dauer

⏱️ **~10-12 Minuten** (inkl. Render Deployment)

### Environment

```yaml
environment:
  name: production
  url: https://issue-tracker.ademdokur.dev
```

### Secrets benötigt

| Secret | Wert |
|--------|------|
| `RENDER_DEPLOY_HOOK_BACKEND` | https://api.render.com/deploy/... |
| `RENDER_DEPLOY_HOOK_FRONTEND` | https://api.render.com/deploy/... |

---

## 💻 Lokale CI-Validierung

### Vor dem Push prüfen

**Empfohlener Workflow**:

```bash
# 1. Änderungen machen
git add .

# 2. Lokale CI Checks ausführen (simuliert GitHub Actions)
npm run ci:local

# 3. Bei Erfolg committen & pushen
git commit -m "feat: Neue Funktion"
git push origin feature/mein-feature
```

### Verfügbare Befehle

| Befehl | Beschreibung | Dauer |
|--------|--------------|-------|
| `npm run ci:local` | **Vollständige CI Checks** (Lint + Build) | ~3 min |
| `npm run lint:all` | Nur Linting | ~30s |
| `npm run build:all` | Nur Builds (Backend + Frontend) | ~2 min |
| `npm run validate` | Alias für `ci:local` | ~3 min |
| `npm run pre-push` | Läuft automatisch vor `git push` (wenn Hook konfiguriert) | ~3 min |

### Git Hooks (Optional)

Automatische Validierung vor Push:

**1. Installiere husky**:
```bash
npm install --save-dev husky
npx husky init
```

**2. Erstelle `.husky/pre-push`**:
```bash
#!/bin/sh
npm run ci:local
```

**3. Jetzt wird bei jedem `git push` automatisch CI lokal geprüft!**

---

## 📊 Workflow-Diagramm

```
┌─────────────────────────────────────────────────────────┐
│  Entwickler                                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  1. Code ändern                                │    │
│  │  2. npm run ci:local (lokal prüfen)            │    │
│  │  3. git commit & push                           │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Feature Branch (GitHub)                                │
│  ┌────────────────────────────────────────────────┐    │
│  │  CI Workflow                                    │    │
│  │  - Lint Code                                    │    │
│  │  - Build Backend                                │    │
│  │  - Build Frontend                               │    │
│  │  Status: ✅ / ❌                                │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Pull Request → master                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  Review + CI Status                             │    │
│  │  Merge wenn CI ✅                               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  master Branch (GitHub)                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │  CD Workflow (automatisch)                      │    │
│  │  1. Build Backend & Frontend                    │    │
│  │  2. Trigger Render Deploy Hooks                 │    │
│  │  3. Wait for deployment                         │    │
│  │  4. Health Checks                               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Production (Render)                                    │
│  ┌────────────────────────────────────────────────┐    │
│  │  🌐 Frontend: issue-tracker.ademdokur.dev      │    │
│  │  🔧 Backend: issue-tracker-backend-23d7...     │    │
│  │  🗄️  Database: PostgreSQL (Internal URL)        │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checkliste vor Push

- [ ] Lokale Änderungen committed
- [ ] `npm run ci:local` ausgeführt
- [ ] Alle CI Checks ✅ bestanden
- [ ] Commit Message sinnvoll
- [ ] Feature Branch gepusht
- [ ] Pull Request erstellt (wenn merge zu master)

---

## 🐛 Troubleshooting

### CI schlägt fehl - Lokal funktioniert

**Mögliche Ursachen**:
1. Node.js Version unterschiedlich (lokal vs. GitHub Actions)
2. `node_modules` cached → `npm ci` ausführen
3. Environment Variables fehlen

**Lösung**:
```bash
# 1. Clean Install
rm -rf node_modules
npm ci --legacy-peer-deps

# 2. Nochmal prüfen
npm run ci:local

# 3. Bei Erfolg pushen
git push
```

### Deployment schlägt fehl

**Prüfen**:
1. GitHub Secrets gesetzt? (RENDER_DEPLOY_HOOK_*)
2. Render Services laufen?
3. Health Check erreichbar?

**Logs checken**:
- GitHub Actions: https://github.com/Ademdkr/issue-tracker/actions
- Render Dashboard: https://dashboard.render.com

### Health Check Timeout

**Normal für Render Free Tier!**
- Cold Start kann 5-10 Minuten dauern
- Deployment ist trotzdem erfolgreich
- Manuell prüfen: https://issue-tracker.ademdokur.dev

---

## 📈 Performance

| Workflow | Durchschnitt | Timeout |
|----------|-------------|---------|
| CI (Lint + Build) | 3-5 min | 10 min |
| CD (Deploy) | 10-12 min | 15 min |
| Lokale CI | 3-4 min | - |

---

## 🔐 Secrets Management

### GitHub Secrets konfigurieren

**Repository Settings → Secrets → Actions**:

1. **RENDER_DEPLOY_HOOK_BACKEND**
   ```
   https://api.render.com/deploy/srv-...?key=...
   ```

2. **RENDER_DEPLOY_HOOK_FRONTEND**
   ```
   https://api.render.com/deploy/srv-...?key=...
   ```

### Deploy Hooks in Render finden

1. Render Dashboard → Service auswählen
2. Settings → Deploy Hook
3. URL kopieren
4. In GitHub Secrets einfügen

---

## 🎯 Best Practices

### Branching Strategy

```
master (production)
  ├── feature/new-feature
  ├── feature/bug-fix
  └── feature/improvement
```

### Commit Messages

```bash
# Feature
git commit -m "feat: Add user authentication"

# Fix
git commit -m "fix: Correct login validation"

# Docs
git commit -m "docs: Update deployment guide"

# Refactor
git commit -m "refactor: Simplify PrismaService"
```

### PR Workflow

1. Feature Branch erstellen
2. Änderungen committen
3. `npm run ci:local` ausführen
4. Push zu GitHub
5. Pull Request erstellen
6. CI wartet auf ✅
7. Code Review
8. Merge zu master
9. CD deployed automatisch

---

## 📚 Weitere Ressourcen

- [GitHub Actions Dokumentation](https://docs.github.com/actions)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Nx Build System](https://nx.dev)
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)

---

**Erstellt**: 30. Dezember 2025  
**Workflows**: 2 (ci.yml, cd.yml)  
**Status**: ✅ Production Ready
