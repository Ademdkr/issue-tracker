# Issue Tracker 🎯

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-20.3-red?logo=angular)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs)](https://nestjs.com/)
[![Nx](https://img.shields.io/badge/Nx-22.2-143055?logo=nx)](https://nx.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.11-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=github-actions)](https://github.com/features/actions)

> **A modern, enterprise-grade issue tracking application built with a fully-typed Nx monorepo architecture.**

Dieses Projekt demonstriert Best Practices für moderne Full-Stack-Entwicklung mit TypeScript, Angular, NestJS und Prisma. Es wurde entwickelt, um professionelle Software-Engineering-Prinzipien zu zeigen: Clean Architecture, SOLID-Prinzipien, JWT-basierte Authentifizierung, RBAC-Autorisierung und CI/CD-Integration.

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%"/>
      <p align="center"><b>Dashboard Übersicht</b></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/ticket-list.png" alt="Ticket Liste" width="100%"/>
      <p align="center"><b>Ticket-Verwaltung</b></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/project-detail.png" alt="Projekt Details" width="100%"/>
      <p align="center"><b>Projekt-Detail-Ansicht</b></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/ticket-detail.png" alt="Ticket Details" width="100%"/>
      <p align="center"><b>Ticket-Bearbeitung</b></p>
    </td>
  </tr>
</table>

> � **Hinweis:** Live-Demo und Screenshots werden nach dem Deployment hinzugefügt

---

## ✨ Features

### 🎯 Kernfunktionen

- ✅ **Vollständiges Issue-Management** - CRUD-Operationen mit Status & Prioritäten
- ✅ **Projekt-basierte Organisation** - Multi-Projekt-Support mit Team-Verwaltung
- ✅ **JWT-Authentifizierung** - Sichere Token-basierte Auth mit Refresh-Tokens
- ✅ **Rollen-basierte Autorisierung (RBAC)** - Admin, Manager, Developer, Viewer-Rollen
- ✅ **Policy-basiertes Berechtigungssystem** - Granulare Zugriffskontrolle
- ✅ **Kommentar-System** - Ticket-Diskussionen mit Mentions
- ✅ **Label-Management** - Flexible Kategorisierung
- ✅ **Dashboard & Analytics** - Echtzeit-Statistiken und Charts
- ✅ **Responsive UI** - Angular Material Design

### 🔒 Sicherheit & Performance

- ✅ **Password Hashing** - bcrypt mit salting
- ✅ **Rate Limiting** - 100 Requests/Minute mit @nestjs/throttler
- ✅ **CORS-Konfiguration** - Sichere Cross-Origin-Anfragen
- ✅ **Input-Validierung** - class-validator DTOs
- ✅ **SQL Injection Protection** - Prisma ORM Prepared Statements
- ✅ **Health Checks** - `/health` Endpoint für Monitoring

### 🛠️ Developer Experience

- ✅ **Nx Monorepo** - Intelligentes Caching & Task-Orchestrierung
- ✅ **Shared Types Library** - Typsichere API-Kommunikation
- ✅ **Hot Module Replacement** - Schnelle Entwicklungszyklen
- ✅ **ESLint + Prettier** - Konsistente Code-Qualität
- ✅ **Jest Testing** - Unit & Integration Tests
- ✅ **GitHub Actions CI/CD** - Automatisierte Pipelines

---

## 🏗️ Architektur

### Monorepo-Struktur (Nx)

```
issue-tracker/
├── apps/
│   ├── frontend/           # Angular 20.3 SPA
│   │   ├── src/app/
│   │   │   ├── auth/       # Authentication Module
│   │   │   ├── dashboard/  # Dashboard & Analytics
│   │   │   ├── projects/   # Project Management
│   │   │   ├── tickets/    # Ticket/Issue Management
│   │   │   └── shared/     # Shared Components & Services
│   │   └── proxy.conf.json # Development Proxy
│   │
│   └── backend/            # NestJS 11 API
│       ├── src/app/
│       │   ├── auth/       # JWT Auth + Guards
│       │   ├── users/      # User Management
│       │   ├── projects/   # Project Module
│       │   ├── tickets/    # Ticket Module
│       │   ├── comments/   # Comment System
│       │   └── core/       # Policies, Decorators, Filters
│       └── prisma/         # Database Schema & Migrations
│
├── libs/
│   └── shared-types/       # Shared DTOs, Enums, Constants
│       ├── auth/           # Auth DTOs
│       ├── projects/       # Project DTOs
│       ├── tickets/        # Ticket DTOs
│       └── constants/      # API Routes, Limits
│
└── docs/                   # Documentation
    ├── backend/            # Backend-spezifische Docs
    ├── frontend/           # Frontend-spezifische Docs
    └── setup/              # Setup-Anleitungen
```

### Tech Stack

#### Frontend

- **Angular 20.3** - Progressive Web Framework
- **TypeScript 5.9** - Statische Typisierung
- **Angular Material** - UI Component Library
- **RxJS** - Reaktive Programmierung
- **ng2-charts** - Chart.js Integration

#### Backend

- **NestJS 11** - Enterprise Node.js Framework
- **Prisma 5.11** - Type-Safe ORM
- **PostgreSQL** - Production Database
- **SQLite** - Development Database
- **Passport JWT** - Authentication Strategy
- **bcrypt** - Password Hashing

#### DevOps & Tools

- **Nx 22.2** - Monorepo Build System
- **Webpack** - Module Bundler
- **Jest** - Testing Framework
- **ESLint** - Linting
- **GitHub Actions** - CI/CD Pipelines

---

## 📊 Database Schema (Prisma)

---

## 📊 Database Schema (Prisma)

<details>
<summary>Vollständiges ERD anzeigen</summary>

```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  name          String
  password      String
  role          Role            @default(DEVELOPER)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  tickets       Ticket[]        @relation("AssignedTickets")
  createdTickets Ticket[]       @relation("CreatedTickets")
  comments      Comment[]
  projectMembers ProjectMember[]
  refreshTokens RefreshToken[]
}

model Project {
  id          String          @id @default(cuid())
  name        String
  description String?
  key         String          @unique
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  tickets     Ticket[]
  labels      Label[]
  members     ProjectMember[]
}

model Ticket {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      Status    @default(OPEN)
  priority    Priority  @default(MEDIUM)
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id])
  assigneeId  String?
  assignee    User?     @relation("AssignedTickets", fields: [assigneeId], references: [id])
  creatorId   String
  creator     User      @relation("CreatedTickets", fields: [creatorId], references: [id])
  labels      TicketLabel[]
  comments    Comment[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  ADMIN
  MANAGER
  DEVELOPER
  VIEWER
}

enum Status {
  OPEN
  IN_PROGRESS
  IN_REVIEW
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

</details>

---

## 🚦 Quick Start

### Voraussetzungen

- **Node.js** 20.x oder höher ([Download](https://nodejs.org/))
- **npm** 10.x oder höher
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (optional für Production) ([Download](https://www.postgresql.org/))

### Installation in 3 Schritten

#### 1️⃣ Repository klonen

```bash
git clone https://github.com/Ademdkr/issue-tracker.git
cd issue-tracker
```

#### 2️⃣ Dependencies installieren

```bash
npm install --legacy-peer-deps
```

> **Hinweis:** Das Flag `--legacy-peer-deps` ist aktuell für Angular 20.3 erforderlich.

#### 3️⃣ Datenbank initialisieren

```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Migrationen ausführen
npx prisma migrate dev

# (Optional) Seed-Daten laden
npx prisma db seed
```

### 🎬 Anwendung starten

**Option A: Beide Server gleichzeitig** (empfohlen für Development)

```bash
# Terminal 1: Backend starten (Port 3000)
npx nx serve backend

# Terminal 2: Frontend starten (Port 4200)
npx nx serve frontend
```

**Option B: Mit wait-on** (automatisiert)

```bash
# Backend starten und warten bis verfügbar
npm run backend:dev

# In neuem Terminal: Frontend starten
npm run frontend:dev
```

### 🌐 URLs nach Start

| Service           | URL                            | Beschreibung                     |
| ----------------- | ------------------------------ | -------------------------------- |
| **Frontend**      | http://localhost:4200          | Angular SPA                      |
| **Backend API**   | http://localhost:3000/api      | REST API                         |
| **API Docs**      | http://localhost:3000/api/docs | Swagger UI                       |
| **Health Check**  | http://localhost:3000/health   | Health Endpoint                  |
| **Prisma Studio** | http://localhost:5555          | DB-Browser (`npx prisma studio`) |

---

## 📚 API-Dokumentation

Die REST API ist vollständig mit **Swagger/OpenAPI** dokumentiert.

### Zugriff auf Swagger UI

1. Backend starten: `npx nx serve backend`
2. Öffne http://localhost:3000/api/docs
3. Authentifizierung: Nutze den "Authorize"-Button mit deinem JWT-Token

### API-Endpunkte Übersicht

| Modul        | Endpunkt        | Methoden                                               | Auth erforderlich |
| ------------ | --------------- | ------------------------------------------------------ | ----------------- |
| **Auth**     | `/api/auth`     | `POST /login`, `POST /register`, `POST /refresh`       | ❌                |
| **Users**    | `/api/users`    | `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`         | ✅                |
| **Projects** | `/api/projects` | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | ✅                |
| **Tickets**  | `/api/tickets`  | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | ✅                |
| **Comments** | `/api/comments` | `GET`, `POST`, `DELETE /:id`                           | ✅                |
| **Labels**   | `/api/labels`   | `GET`, `POST`, `PATCH /:id`, `DELETE /:id`             | ✅                |

**Beispiel-Request:**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Ticket erstellen (mit JWT Token)
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Fix",
    "description": "Fix login error",
    "projectId": "project-id",
    "priority": "HIGH"
  }'
```

---

## 🧪 Testing

### Unit Tests

```bash
# Backend Tests
npx nx test backend

# Frontend Tests
npx nx test frontend

# Mit Coverage-Report
npx nx test backend --coverage
npx nx test frontend --coverage
```

### E2E Tests

```bash
# Backend E2E Tests
npx nx e2e backend-e2e

# Frontend E2E Tests (Cypress)
npx nx e2e frontend-e2e
```

### Test-Coverage anzeigen

```bash
# Nach dem Test mit --coverage
open coverage/apps/backend/index.html  # macOS
start coverage/apps/backend/index.html # Windows
```

---

## 🛠️ Development Scripts

### Build & Deploy

```bash
# Production Build
npx nx build backend --configuration=production
npx nx build frontend --configuration=production

# Build für alle Projekte
npx nx run-many -t build --all

# Build nur geänderte Projekte
npx nx affected -t build
```

### Code Quality

```bash
# Linting
npx nx lint backend
npx nx lint frontend
npx nx run-many -t lint --all

# Formatting
npx nx format:write  # Auto-fix
npx nx format:check  # Nur prüfen

# Type-Checking
npx nx run backend:tsc
```

### Datenbank-Operationen

```bash
# Neue Migration erstellen
npx prisma migrate dev --name <migration-name>

# Migration auf Production anwenden
npx prisma migrate deploy

# Prisma Studio öffnen (DB-Browser)
npx prisma studio

# Datenbank zurücksetzen (⚠️ nur Development!)
npx prisma migrate reset

# Seed-Daten laden
npx prisma db seed
```

### Nx Utilities

```bash
# Projekt-Abhängigkeiten visualisieren
npx nx graph

# Betroffene Projekte anzeigen
npx nx affected:graph

# Cache löschen
npx nx reset
```

---

## 📖 Dokumentation

### Setup-Anleitungen

- 📘 [Setup-Anleitung (Deutsch)](./docs/setup/SETUP_ANLEITUNG.md)
- 📘 [Prisma Setup](./docs/setup/PRISMA_SETUP_ANLEITUNG.md)
- 📘 [Docker Setup](./docs/setup/DOCKER_SETUP_ANLEITUNG.md)
- 📘 [GitHub Setup](./docs/setup/GITHUB_ANLEITUNG.md)

### Architektur & Design

- 🏗️ [System-Architektur](./docs/ARCHITECTURE.md) _(wird erstellt)_
- 🏗️ [Backend-Mapping-Strategie](./docs/backend/MAPPING_STRATEGY.md)
- 🏗️ [Policy-System](./docs/backend/policy/policy-system-implementation.md)
- 🏗️ [Frontend-Struktur](./docs/frontend/folder-structure.md)

### Feature-Dokumentation

- 🔐 [JWT-Authentifizierung](./docs/backend/auth/jwt-implementation-guide.md)
- 🔐 [Authorization & Guards](./docs/backend/auth/authentication-guards.md)
- 🎫 [Ticket-Management](./docs/TICKET_TABLE_IMPLEMENTATION_GUIDE.md)
- 📊 [Dashboard-Implementierung](./docs/PROJECT_DETAIL_IMPLEMENTATION_GUIDE.md)

### CI/CD & Deployment

- 🚀 [CI/CD Setup](./docs/setup/ci-cd-setup.md)
- 🚀 [CI Quickstart](./docs/setup/ci-quickstart.md)
- 🚀 [Production Readiness](./docs/production-readiness.md)
- 🚀 [Performance-Optimierungen](./docs/performance-optimizations.md)

---

## 🤝 Contributing

Contributions sind willkommen! Bitte lies die [CONTRIBUTING.md](./CONTRIBUTING.md) _(wird erstellt)_ für Details zum Code of Conduct und Pull Request Prozess.

### Development Workflow

1. **Fork** das Repository
2. **Branch erstellen**: `git checkout -b feature/amazing-feature`
3. **Änderungen committen**: `git commit -m 'feat: add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Pull Request** öffnen

### Commit-Konventionen

Wir nutzen [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: neue Feature
fix: Bug-Fix
docs: Dokumentation
style: Formatierung
refactor: Code-Umstrukturierung
test: Tests hinzufügen
chore: Build-Prozess, Dependencies
```

---

## 📝 License

Dieses Projekt ist unter der **MIT License** lizenziert - siehe [LICENSE](./LICENSE) für Details.

---

## 👨‍💻 Autor

**Adem Decker**

- GitHub: [@Ademdkr](https://github.com/Ademdkr)
- LinkedIn: [Adem Decker](https://linkedin.com/in/adem-decker) _(Platzhalter - bitte anpassen)_
- Portfolio: [ademdecker.dev](https://ademdecker.dev) _(Platzhalter - bitte anpassen)_

---

## 🙏 Acknowledgments

- **Nx Team** - Für das großartige Monorepo-Tool
- **NestJS Team** - Für das Enterprise-Framework
- **Prisma Team** - Für das moderne ORM
- **Angular Team** - Für das robuste Frontend-Framework

---

## 🔗 Links & Ressourcen

### Projekt

- 📦 [npm Package](https://www.npmjs.com/package/@issue-tracker/source) _(falls veröffentlicht)_
- 📊 [GitHub Issues](https://github.com/Ademdkr/issue-tracker/issues)
- 🔀 [Pull Requests](https://github.com/Ademdkr/issue-tracker/pulls)
- 📈 [Projekt-Board](https://github.com/users/Ademdkr/projects) _(optional)_

### Technologie-Dokumentation

- [Nx Documentation](https://nx.dev/)
- [NestJS Documentation](https://nestjs.com/)
- [Angular Documentation](https://angular.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

<div align="center">

**⭐ Wenn dir dieses Projekt gefällt, gib ihm einen Star auf GitHub! ⭐**

Built with ❤️ using **Nx**, **Angular**, **NestJS**, and **Prisma**

</div>
