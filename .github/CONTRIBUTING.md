# Contributing zum Issue Tracker

Vielen Dank für Ihr Interesse, zu diesem Projekt beizutragen! 🎉

## Entwicklungs-Setup

### Voraussetzungen

- Node.js 20.x oder höher
- npm
- Git

### Projekt Setup

```bash
# Repository klonen
git clone https://github.com/username/issue-tracker.git
cd issue-tracker

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Branch-Strategie

- `main` - Produktionscode, immer stabil
- `develop` - Entwicklungsbranch, für neue Features
- `feature/xyz` - Feature-Branches
- `bugfix/xyz` - Bug-Fix-Branches
- `hotfix/xyz` - Hotfix-Branches für Produktionsfehler

## Commit-Konventionen

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Neues Feature
- `fix`: Bug Fix
- `docs`: Dokumentationsänderungen
- `style`: Code-Formatierung (keine funktionalen Änderungen)
- `refactor`: Code-Refactoring
- `test`: Tests hinzufügen oder korrigieren
- `chore`: Wartungsarbeiten, Build-Änderungen

### Beispiele

```bash
feat(tickets): add ticket filtering by priority
fix(auth): resolve login token expiration issue
docs(readme): update setup instructions
```

## Pull Request Prozess

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'feat: add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

### PR Checkliste

- [ ] Code folgt dem Projekt-Style Guide
- [ ] Tests wurden hinzugefügt/aktualisiert
- [ ] Alle Tests bestehen
- [ ] Dokumentation wurde aktualisiert
- [ ] Keine Linter-Warnungen

## Code Style

- Verwende ESLint und Prettier (wird automatisch ausgeführt)
- Folge den TypeScript Best Practices
- Schreibe aussagekräftige Variablennamen
- Kommentiere komplexen Code

## Testing

```bash
# Unit Tests
npx nx test [project-name]

# E2E Tests
npx nx e2e [project-name]-e2e

# Alle Tests
npx nx run-many -t test --all
```

## Fragen?

Bei Fragen öffne ein Issue oder kontaktiere das Team.

## Code of Conduct

Sei respektvoll und professionell in allen Interaktionen.
