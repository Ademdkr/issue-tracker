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

* Neue Features
* Klare, abgeschlossene Aufgaben
* Bugfixes
* Refactorings
* Dokumentations-Blöcke

**Beispiel:**

```
feature/project-crud
feature/ticket-detail-ui
hotfix/login-bug
docs/api-description
```

## ✔️ Wenn du KEINEN neuen Branch brauchst

* Kleine Zwischenschritte am selben Feature
* Fortsetzung der Implementierung, die thematisch zusammengehört
* Work-in-progress (WIP)-Commits
* Refactoring im aktuellen Feature

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

* viele kleine Commits
* regelmäßiges Pushen zur Sicherung
* erst am Ende einen Pull Request / Merge

## ✔️ Commit-Konventionen (Empfohlen)

Nutze präzise Commit-Tags:

* `feat:` – neue Funktion
* `fix:` – Bugfix
* `docs:` – Dokumentation
* `refactor:` – Code-Verbesserung ohne neue Funktion
* `style:` – Formatierung
* `test:` – Tests

**Beispiele:**

```
feat: add project detail endpoint
fix: correct status update logic
docs: add API overview for project module
```

---

# 📌 Kurzfazit

* Neue Branches **ja**, aber nur für **thematische Features oder Bugs**.
* Für kleine Schritte auf demselben Feature **denselben Branch weiterverwenden**.
* Regelmäßig committen und pushen, um Fortschritt zu sichern.
* Dadurch bleibt dein GitHub sauber, nachvollziehbar und strukturiert.

---

Wenn du möchtest, kann ich dir auch
✅ eine komplette Branch-Namenskonvention
oder
✅ ein GitHub-Flow Diagramm
erstellen.
