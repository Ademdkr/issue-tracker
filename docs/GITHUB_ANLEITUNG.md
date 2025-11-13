# GitHub Push Anleitung

Diese Schritte wurden ausgeführt, um Änderungen auf einen neuen Branch zu pushen.

1. Neuen Branch erstellen und darauf wechseln:

```bash
git checkout -b feature/projects-backend-intregration-started
```

2. Status prüfen (zeigt geänderte und unversionierte Dateien):

```bash
git status --short
```

3. Alle Änderungen zum Commit vormerken:

```bash
git add .
```

4. Commit erstellen mit Nachricht:

```bash
git commit -m "feat: projects backend integration start + docs"
```

5. Branch zu GitHub pushen (neuer Branch):

```bash
git push -u origin feature/projects-backend-intregration-started
```

Nur diese Schritte wurden ausgeführt, um den Code auf den neuen Branch hochzuladen.