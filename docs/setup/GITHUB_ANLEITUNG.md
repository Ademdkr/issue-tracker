Hier ist deine **erweiterte Version der `GITHUB_ANLEITUNG.md`**, inklusive meiner Empfehlungen zu Branch-Strategie, Commit-Praxis und dem Umgang mit kleinen Implementierungen.

Du kannst den Text direkt übernehmen:

---

# GitHub Push Anleitung

Diese Schritte werden ausgeführt, um Änderungen auf einen **neuen Branch** zu pushen.

## 🔹 Standard-Workflow: Änderungen auf einen neuen Branch pushen

1. **Neuen Branch erstellen und darauf wechseln:**

```bash
git checkout -b feature/projects-backend-intregration-started
```

2. **Status prüfen** (zeigt geänderte und unversionierte Dateien):

```bash
git status --short
```

3. **Alle Änderungen zum Commit vormerken:**

```bash
git add .
```

4. **Commit erstellen mit Nachricht:**

```bash
git commit -m "feat: projects backend integration start + docs"
```

5. **Branch zu GitHub pushen** (neuer Branch):

```bash
git push -u origin feature/projects-backend-intregration-started
```

Nur diese Schritte wurden ausgeführt, um den Code auf den neuen Branch hochzuladen.

---

# 🔥 Empfohlene Git-Strategie

Um sauber und effizient zu arbeiten, solltest du **nicht für jede kleine Änderung einen neuen Branch erstellen**. Stattdessen:

## ✔️ Wann ein neuer Branch sinnvoll ist

- Neue Features
- Klare, abgeschlossene Aufgaben
- Bugfixes
- Refactorings
- Dokumentations-Blöcke

**Beispiel:**

```
feature/project-crud
feature/ticket-detail-ui
hotfix/login-bug
docs/api-description
```

## ✔️ Wenn du KEINEN neuen Branch brauchst

- Kleine Zwischenschritte am selben Feature
- Fortsetzung der Implementierung, die thematisch zusammengehört
- Work-in-progress (WIP)-Commits
- Refactoring im aktuellen Feature

### Beispiel: Weiterarbeit im gleichen Feature-Branch

```bash
git add .
git commit -m "feat: continue backend integration"
git push
```

---

# 🎯 Best Practices für tägliches Arbeiten

## ✔️ Feature-Branch über mehrere Tage nutzen

Ein Feature-Branch wird genutzt, **bis das Feature fertig ist**:

- viele kleine Commits
- regelmäßiges Pushen zur Sicherung
- erst am Ende einen Pull Request / Merge

## ✔️ Commit-Konventionen (Empfohlen)

Nutze präzise Commit-Tags:

- `feat:` – neue Funktion
- `fix:` – Bugfix
- `docs:` – Dokumentation
- `refactor:` – Code-Verbesserung ohne neue Funktion
- `style:` – Formatierung
- `test:` – Tests

**Beispiele:**

```
feat: add project detail endpoint
fix: correct status update logic
docs: add API overview for project module
```

---

# 📌 Kurzfazit

- Neue Branches **ja**, aber nur für **thematische Features oder Bugs**.
- Für kleine Schritte auf demselben Feature **denselben Branch weiterverwenden**.
- Regelmäßig committen und pushen, um Fortschritt zu sichern.
- Dadurch bleibt dein GitHub sauber, nachvollziehbar und strukturiert.

---

# 🔀 Pull Request (PR) erstellen

Ein Pull Request wird erstellt, wenn du dein Feature fertig hast und es in den Main-Branch mergen möchtest.

## ✔️ Variante 1: PR über GitHub UI (empfohlen)

1. **GitHub Repository öffnen** im Browser
2. Nach dem Push siehst du oben eine gelbe Box: **"Compare & pull request"** → Klicken
3. **PR-Formular ausfüllen:**
   - **Title:** Kurze, prägnante Beschreibung (z.B. `feat: projects backend integration`)
   - **Description:** Wird automatisch aus der `pull_request_template.md` befüllt
   - Ergänze:
     - Was wurde implementiert?
     - Welche Änderungen wurden vorgenommen?
     - Screenshots (bei UI-Änderungen)
     - Related Issues verlinken
4. **Reviewer zuweisen** (optional)
5. **Create Pull Request** klicken

## ✔️ Variante 2: PR über GitHub CLI

Wenn du GitHub CLI installiert hast:

```bash
# PR erstellen und Browser öffnen
gh pr create --web

# Oder direkt mit Title und Body
gh pr create --title "feat: projects backend integration" --body "Implementiert CRUD Endpoints für Projects"
```

---

# 🤖 Automatische Reviews & Checks

Sobald du einen PR erstellst, starten **automatisch mehrere Überprüfungen**:

## ✅ GitHub Actions CI-Pipeline

Läuft automatisch bei jedem PR und prüft:

1. **Lint** - ESLint auf affected Projekte
2. **Build** - Frontend + Backend bauen
3. **TypeCheck** - TypeScript-Compiler
4. **Security** - npm audit auf Sicherheitslücken

**Status im PR:**

- ✅ Grünes Häkchen = Alle Checks erfolgreich
- ❌ Rotes Kreuz = Fehler (Details in Actions-Tab)
- 🟡 Gelber Kreis = Läuft noch

## ✅ Dependency Review

Prüft automatisch alle neuen Dependencies auf:

- Bekannte Sicherheitslücken
- Lizenz-Probleme (GPL, AGPL)
- Deprecated Packages

## ✅ CodeQL Security Analysis

Führt wöchentlich und bei PRs Sicherheitsanalysen durch:

- SQL-Injection
- XSS-Vulnerabilities
- Unsichere Funktionen

## ✅ CODEOWNERS Auto-Review

Automatische Reviewer-Zuweisung basierend auf geänderten Dateien:

- Frontend-Änderungen → Frontend-Team
- Backend-Änderungen → Backend-Team
- CI-Änderungen → DevOps-Team

**Konfiguriert in:** `.github/CODEOWNERS`

---

# 🛡️ Branch Protection Rules (optional, empfohlen für Main)

Um sicherzustellen, dass nur geprüfter Code in `main` kommt:

1. **GitHub Repository öffnen** → Settings → Branches
2. **Add branch protection rule** für `main`
3. **Empfohlene Einstellungen:**
   - ✅ Require pull request before merging
   - ✅ Require approvals (mindestens 1)
   - ✅ Require status checks to pass before merging:
     - `lint`
     - `build`
     - `typecheck`
     - `security`
   - ✅ Require branches to be up to date before merging
   - ⚠️ Include administrators (optional, für persönliche Projekte nicht nötig)

**Effekt:** Direktes Pushen zu `main` wird blockiert, nur Merges über PRs möglich.

---

# 📋 PR-Workflow Zusammenfassung

```
1. Feature-Branch erstellen
   git checkout -b feature/neue-funktion

2. Code entwickeln & committen
   git add .
   git commit -m "feat: neue Funktion"
   git push -u origin feature/neue-funktion

3. PR erstellen (GitHub UI oder CLI)
   → Automatische Checks starten

4. Auf Review warten (optional)
   → CI-Pipeline muss grün sein

5. PR mergen
   → Main-Branch wird aktualisiert
   → Feature-Branch kann gelöscht werden

6. Lokalen Main aktualisieren
   git checkout main
   git pull origin main
```

---

# 💡 Tipps für gute PRs

- **Klein halten:** Max. 300-500 Zeilen pro PR
- **Beschreibend:** Erkläre WAS und WARUM, nicht nur WIE
- **Screenshots:** Bei UI-Änderungen immer Bilder anhängen
- **Tests:** Beschreibe manuelle Test-Schritte
- **Draft PRs:** Nutze Draft-Status für Work-in-Progress
- **Self-Review:** Checke deinen Code nochmal in der GitHub-Diff-Ansicht

---

# 🚀 Next Steps nach diesem PR

- Main-Branch lokal aktualisieren: `git checkout main && git pull`
- Feature-Branch löschen: `git branch -d feature/alte-funktion`
- Remote-Branch löschen: `git push origin --delete feature/alte-funktion` (oder über GitHub UI)

---

Wenn du möchtest, kann ich dir auch
✅ eine komplette Branch-Namenskonvention
oder
✅ ein GitHub-Flow Diagramm
erstellen.
