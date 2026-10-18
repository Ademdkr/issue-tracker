# Contributing to Issue Tracker

Vielen Dank für dein Interesse, zu diesem Projekt beizutragen! 🎉

Dieses Dokument enthält Richtlinien und Best Practices für Contributions. Bitte lies es sorgfältig durch, bevor du einen Pull Request öffnest.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Project Structure](#project-structure)

---

## 🤝 Code of Conduct

Dieses Projekt folgt dem [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Mit deiner Teilnahme erklärst du dich damit einverstanden, diese Standards einzuhalten.

---

## 🚀 Getting Started

### Voraussetzungen

- **Node.js** 20.x oder höher
- **npm** 10.x oder höher
- **Git** 2.x oder höher
- **PostgreSQL** (optional, für Production-DB-Tests)

### Repository Setup

1. **Fork das Repository** auf GitHub

2. **Clone deinen Fork**

   ```bash
   git clone https://github.com/DEIN-USERNAME/issue-tracker.git
   cd issue-tracker
   ```

3. **Upstream Remote hinzufügen**

   ```bash
   git remote add upstream https://github.com/Ademdkr/issue-tracker.git
   ```

4. **Dependencies installieren**

   ```bash
   npm install --legacy-peer-deps
   ```

5. **Datenbank initialisieren**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Development Server starten**

   ```bash
   # Terminal 1: Backend
   npx nx serve backend

   # Terminal 2: Frontend
   npx nx serve frontend
   ```

---

## 🔄 Development Workflow

### 1. Branch erstellen

Erstelle einen neuen Feature-Branch von `master`:

```bash
git checkout master
git pull upstream master
git checkout -b feature/deine-feature-beschreibung
```

**Branch-Naming-Konventionen:**

- `feature/` - Neue Features
- `fix/` - Bug-Fixes
- `docs/` - Dokumentation
- `refactor/` - Code-Refactoring
- `test/` - Tests hinzufügen
- `chore/` - Build-Prozess, Dependencies

**Beispiele:**

```bash
git checkout -b feature/add-ticket-filters
git checkout -b fix/login-validation-error
git checkout -b docs/api-documentation
```

### 2. Änderungen entwickeln

- Schreibe **sauberen, lesbaren Code**
- Folge den [Coding Standards](#coding-standards)
- Füge **Tests** für neue Features hinzu
- Update **Dokumentation** wenn nötig

### 3. Code Quality prüfen

Vor jedem Commit:

```bash
# Linting
npx nx lint backend
npx nx lint frontend

# Formatierung
npx nx format:write

# Type-Checking
npx tsc --noEmit

# Tests
npx nx test backend
npx nx test frontend
```

### 4. Commit erstellen

Folge den [Commit Guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add ticket filter by assignee"
```

### 5. Push & Pull Request

```bash
git push origin feature/deine-feature-beschreibung
```

Erstelle dann einen Pull Request auf GitHub.

---

## 📏 Coding Standards

### TypeScript

- **Strict Mode** aktiviert (`strict: true`)
- **Explizite Typen** für Funktionsparameter und Rückgabewerte
- **Interfaces** für Objekt-Shapes, **Types** für Unions/Intersections
- **Enums** vermeiden, nutze Union Types

**Gut:**

```typescript
interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
}

function getUserById(id: string): Promise<User | null> {
  // Implementation
}
```

**Schlecht:**

```typescript
function getUser(id) {
  // ❌ Fehlende Typen
  return users.find((u) => u.id === id);
}
```

### NestJS Backend

- **Dependency Injection** nutzen
- **DTOs** aus `@issue-tracker/shared-types` importieren
- **Validation** mit `class-validator` Decorators
- **Guards** für Authentication/Authorization
- **Interceptors** für Logging/Transformation
- **Exception Filters** für Error Handling

**Beispiel:**

```typescript
// ✅ Gut
import { CreateTicketDto } from '@issue-tracker/shared-types';

@Controller('tickets')
@UseGuards(JwtAuthGuard, TicketPermissionGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto): Promise<TicketResponseDto> {
    return this.ticketsService.create(dto);
  }
}
```

### Angular Frontend

- **Standalone Components** (Angular 20+)
- **Reactive Forms** für komplexe Formulare
- **RxJS Operators** für State Management
- **OnPush Change Detection** wo möglich
- **Typed Services** mit Interfaces

**Beispiel:**

```typescript
// ✅ Gut
@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class TicketListComponent implements OnInit {
  tickets$ = this.ticketService.getTickets();

  constructor(private ticketService: TicketService) {}
}
```

### Code-Formatierung

- **ESLint** für Code-Qualität
- **Prettier** für Formatierung (automatisch via `nx format`)
- **2 Spaces** Einrückung
- **Single Quotes** für Strings
- **Semicolons** verwenden
- **Trailing Commas** in Multiline

---

## 💬 Commit Guidelines

Wir nutzen **[Conventional Commits](https://www.conventionalcommits.org/)**:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - Neues Feature
- `fix` - Bug-Fix
- `docs` - Dokumentation
- `style` - Formatierung (kein Code-Change)
- `refactor` - Code-Refactoring
- `test` - Tests hinzufügen/ändern
- `chore` - Build, Dependencies, Tools

### Scope (optional)

- `backend` - Backend-Änderungen
- `frontend` - Frontend-Änderungen
- `shared-types` - Shared Types Library
- `ci` - CI/CD Pipeline
- `docker` - Docker-Setup

### Beispiele

```bash
feat(backend): add ticket assignment endpoint
fix(frontend): resolve login form validation error
docs: update API documentation
refactor(backend): extract ticket policy logic
test(frontend): add ticket list component tests
chore(deps): update Angular to 20.3.1
```

### Subject-Regeln

- **Imperativ** ("add" nicht "added")
- **Kleinschreibung** beginnen
- **Keine Punkt** am Ende
- **Max 72 Zeichen**

---

## 🔀 Pull Request Process

### PR-Checklist

Bevor du einen PR öffnest, stelle sicher:

- [ ] Code folgt den [Coding Standards](#coding-standards)
- [ ] Alle Tests laufen erfolgreich
- [ ] Linting ohne Fehler (`nx lint`)
- [ ] Formatierung korrekt (`nx format:check`)
- [ ] Neue Features haben Tests
- [ ] Dokumentation aktualisiert (falls nötig)
- [ ] Commits folgen [Conventional Commits](#commit-guidelines)
- [ ] Branch ist aktuell mit `master`

### PR-Beschreibung Template

```markdown
## Beschreibung

Kurze Beschreibung der Änderungen.

## Typ der Änderung

- [ ] Bug-Fix
- [ ] Neues Feature
- [ ] Breaking Change
- [ ] Dokumentation

## Änderungen

- Ändert X
- Fügt Y hinzu
- Entfernt Z

## Testing

Wie wurde getestet?

## Screenshots (falls UI-Änderungen)

Füge Screenshots hinzu.

## Checklist

- [ ] Tests hinzugefügt
- [ ] Dokumentation aktualisiert
- [ ] Keine Breaking Changes (oder dokumentiert)
```

### Review-Prozess

1. **Automatische Checks** müssen grün sein (GitHub Actions)
2. **Code Review** von mindestens 1 Maintainer
3. **Feedback einarbeiten** falls nötig
4. **Merge** durch Maintainer (Squash & Merge)

---

## ✅ Testing Requirements

### Unit Tests

Jedes neue Feature benötigt Unit Tests:

```typescript
// Backend: ticket.service.spec.ts
describe('TicketsService', () => {
  it('should create a new ticket', async () => {
    // Test implementation
  });
});

// Frontend: ticket-list.component.spec.ts
describe('TicketListComponent', () => {
  it('should display tickets', () => {
    // Test implementation
  });
});
```

### Test-Coverage

- **Minimum 70%** Coverage für neue Features
- **Critical Paths** (Auth, Payments) 90%+

Coverage prüfen:

```bash
npx nx test backend --coverage
npx nx test frontend --coverage
```

### E2E Tests

Für kritische User-Flows E2E-Tests hinzufügen.

---

## 📁 Project Structure

```
issue-tracker/
├── apps/
│   ├── backend/              # NestJS Backend
│   │   ├── src/app/
│   │   │   ├── auth/         # Authentication & JWT
│   │   │   ├── users/        # User Management
│   │   │   ├── projects/     # Project Module
│   │   │   ├── tickets/      # Ticket Module
│   │   │   ├── comments/     # Comment System
│   │   │   └── core/         # Guards, Policies, Filters
│   │   └── prisma/           # Database Schema & Migrations
│   │
│   └── frontend/             # Angular Frontend
│       └── src/app/
│           ├── auth/         # Auth Module
│           ├── dashboard/    # Dashboard
│           ├── projects/     # Project Management
│           ├── tickets/      # Ticket Management
│           └── shared/       # Shared Components
│
├── libs/
│   └── shared-types/         # Shared DTOs & Types
│       ├── auth/             # Auth DTOs
│       ├── projects/         # Project DTOs
│       ├── tickets/          # Ticket DTOs
│       └── constants/        # Constants
│
└── docs/                     # Documentation
```

### Wichtige Dateien

- `apps/backend/prisma/schema.prisma` - Database Schema
- `libs/shared-types/` - Shared DTOs (immer hier definieren!)
- `nx.json` - Nx Konfiguration
- `tsconfig.base.json` - TypeScript Config

---

## 🐛 Bug Reports

Bugs bitte als GitHub Issue melden mit:

1. **Beschreibung** des Problems
2. **Schritte zur Reproduktion**
3. **Erwartetes Verhalten**
4. **Tatsächliches Verhalten**
5. **Screenshots** (falls relevant)
6. **Environment** (Node-Version, OS, Browser)

---

## 💡 Feature Requests

Feature-Ideen sind willkommen! Bitte:

1. **Prüfe** ob das Feature bereits als Issue existiert
2. **Beschreibe** den Use Case
3. **Erkläre** warum es nützlich ist
4. **Skizziere** eine mögliche Implementierung

---

## 📞 Fragen?

Bei Fragen:

- 💬 Öffne ein [GitHub Discussion](https://github.com/Ademdkr/issue-tracker/discussions)
- 📧 Kontaktiere [@Ademdkr](https://github.com/Ademdkr)

---

## 🙏 Danke!

Jeder Beitrag hilft, dieses Projekt besser zu machen. Danke für deine Zeit und dein Engagement! ❤️
