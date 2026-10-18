> Historisches Dokument. Maßgeblich sind [Deployment](../../../deployment/README.md) und [Schnellstart](../../../QUICKSTART.md). Beispiele können veraltet sein.

# CI-Pipeline Quickstart Guide

## ✅ Schritt-für-Schritt Anleitung

### 1. Code committen und pushen

Die CI-Pipeline startet automatisch bei:

- Push auf `main` oder `develop` Branch
- Pull Requests zu `main` oder `develop`

```bash
# Änderungen committen
git add .
git commit -m "feat: setup CI pipeline"

# Zu GitHub pushen
git push origin main
```

### 2. Pipeline-Status überprüfen

Nach dem Push:

1. Gehe zu deinem GitHub Repository
2. Klicke auf den Tab **"Actions"**
3. Du siehst den laufenden Workflow "CI"

### 3. Was die CI-Pipeline prüft

Die Pipeline führt folgende Checks durch:

| Job          | Beschreibung                   | Dauer    |
| ------------ | ------------------------------ | -------- |
| ✅ Setup     | Installiert Dependencies       | ~2-3 Min |
| ✅ Lint      | ESLint auf betroffene Projekte | ~30 Sek  |
| ✅ Test      | Unit Tests mit Coverage        | ~1-2 Min |
| ✅ Build     | Baut Frontend & Backend        | ~2-3 Min |
| ✅ TypeCheck | TypeScript Compiler Check      | ~30 Sek  |
| ✅ Security  | npm Security Audit             | ~30 Sek  |
| ✅ E2E       | End-to-End Tests (optional)    | ~3-5 Min |

**Gesamtdauer:** ~8-12 Minuten beim ersten Mal, danach durch Caching schneller (~5-7 Min)

### 4. Lokale CI-Checks (vor dem Push)

Um Probleme früh zu erkennen, führe lokal aus:

```bash
# Alle CI-Checks lokal ausführen
npm run ci:check

# Oder einzeln:
npm run ci:lint    # ESLint
npm run ci:test    # Unit Tests
npm run ci:build   # Build-Check
```

### 5. Häufige Probleme & Lösungen

#### ❌ Pipeline schlägt bei "Lint" fehl

**Problem:** ESLint-Fehler im Code

**Lösung:**

```bash
# Fehler anzeigen
npm run ci:lint

# Automatisch beheben (wo möglich)
npx nx affected -t lint --fix
```

#### ❌ Pipeline schlägt bei "Test" fehl

**Problem:** Tests schlagen fehl oder fehlen

**Lösung:**

```bash
# Tests lokal ausführen
npm run ci:test

# Bestimmtes Projekt testen
npx nx test backend
npx nx test frontend
```

#### ❌ Pipeline schlägt bei "Build" fehl

**Problem:** TypeScript-Fehler oder fehlende Dependencies

**Lösung:**

```bash
# Build lokal testen
npm run ci:build

# TypeScript-Fehler anzeigen
npx tsc --noEmit
```

#### ❌ Pipeline schlägt bei "TypeCheck" fehl

**Problem:** TypeScript-Typfehler

**Lösung:**

```bash
# TypeScript prüfen
npx tsc --noEmit

# In VSCode: Problems Panel (Strg+Shift+M)
```

### 6. Pipeline-Logs ansehen

Wenn die Pipeline fehlschlägt:

1. GitHub → **Actions** Tab
2. Klick auf den fehlgeschlagenen Workflow Run
3. Klick auf den fehlgeschlagenen Job (z.B. "Lint")
4. Erweitere die fehlgeschlagenen Steps
5. Lies die Error-Logs

### 7. Badge im README (Optional)

Füge einen Status-Badge zu deinem README hinzu:

```markdown
![CI Status](https://github.com/username/issue-tracker/workflows/CI/badge.svg)
```

## 🚀 Erste Schritte Checklist

- [ ] Code zu GitHub gepusht
- [ ] Actions Tab überprüft
- [ ] CI-Pipeline läuft durch (alle Jobs grün ✅)
- [ ] Lokale CI-Scripts getestet (`npm run ci:check`)
- [ ] Branch Protection Rules eingerichtet (optional, siehe CI_CD_SETUP.md)

## 🔧 Optimierungen

### Nx Cloud für schnellere Builds (empfohlen)

```bash
# Nx Cloud verbinden (kostenlos für Open Source)
npx nx connect-to-nx-cloud

# Token wird automatisch generiert
```

Dann füge als GitHub Secret hinzu:

```
NX_CLOUD_ACCESS_TOKEN=<dein-token>
```

**Vorteil:** Builds werden von ~10 Min auf ~2-3 Min reduziert durch Distributed Caching!

### E2E Tests deaktivieren (falls sie zu lange dauern)

In `.github/workflows/ci.yml`, kommentiere den E2E Job aus:

```yaml
# e2e:
#   name: E2E Tests (Affected)
#   runs-on: ubuntu-latest
#   ...
```

## 📊 Was passiert als Nächstes?

Nach erfolgreichem CI-Durchlauf:

1. ✅ **Pull Requests:** CI muss grün sein vor dem Merge
2. ✅ **Code Reviews:** Kollegen können Code reviewen
3. ✅ **Branch Protection:** Main Branch ist geschützt
4. 🚫 **Deployment:** Aktuell deaktiviert (kann später aktiviert werden)

## 🔐 Security Workflows

Zusätzlich laufen automatisch:

- **Dependency Review** (bei PRs) - Prüft neue Dependencies
- **CodeQL Analysis** (wöchentlich) - Security Scanning

Diese können auch manuell getriggert werden unter Actions → Workflow auswählen → "Run workflow"

## ⚠️ Deployment (aktuell deaktiviert)

Die Deployment-Workflows sind deaktiviert:

- `deploy-staging.yml` - Nur manuell über "Run workflow" Button
- `deploy-production.yml` - Nur manuell über "Run workflow" Button

Um sie zu aktivieren, siehe `CI_CD_SETUP.md` → Abschnitt "Deployment aktivieren"

## 🆘 Support

Bei Problemen:

1. Prüfe die Logs im Actions Tab
2. Führe `npm run ci:check` lokal aus
3. Konsultiere `CI_CD_SETUP.md` für Details
4. Öffne ein Issue bei anhaltenden Problemen

## 🎉 Erfolg!

Wenn alle Jobs grün sind ✅:

- Dein Code entspricht den Style Guidelines
- Alle Tests bestehen
- Der Build funktioniert
- Keine TypeScript-Fehler
- Keine Security-Probleme

→ Bereit für Production! 🚀
