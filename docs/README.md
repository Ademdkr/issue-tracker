# Dokumentation - Issue Tracker

## 📚 Übersicht

Diese Dokumentation enthält umfassende Informationen über die Architektur, Einrichtung und Best Practices des Issue Tracker Projekts.

## 🗂️ Dokumentationsstruktur

```
docs/
├── README.md                          # Diese Datei
├── architecture/                      # Architektur & Design
│   ├── architecture-diagram.md        # System-Architektur Diagramme
│   └── database-erd.md               # ER-Diagramm (auto-generiert)
├── setup/                            # Installation & Konfiguration
│   ├── SETUP_ANLEITUNG.md            # Hauptinstallation
│   ├── DOCKER_SETUP_ANLEITUNG.md     # Docker Setup
│   ├── PRISMA_SETUP_ANLEITUNG.md     # Prisma ORM
│   ├── GITHUB_ANLEITUNG.md           # GitHub & Git
│   ├── NESTJS_CLI_ANLEITUNG.md       # NestJS CLI
│   ├── angular-cli-commands.md       # Angular CLI
│   ├── angular-material-setup.md     # Material Design
│   ├── ci-cd-setup.md                # CI/CD Pipelines
│   └── ci-quickstart.md              # CI Schnellstart
├── guides/                           # Entwickler-Guides
│   ├── backend/                      # Backend (NestJS)
│   │   ├── architecture.md
│   │   ├── MAPPING_STRATEGY.md
│   │   ├── auth/
│   │   └── policy/
│   ├── frontend/                     # Frontend (Angular)
│   │   ├── folder-structure.md
│   │   ├── label-management.md
│   │   ├── member-management-selection.md
│   │   ├── project-detail-*.md
│   │   ├── ticket-*.md
│   │   ├── layout-integration.md
│   │   └── auth/
│   └── shared-types/                 # Shared Library
│       └── shared-types-consistency.md
├── project/                          # Projekt Management
│   ├── agents.md                     # Agent-Entwicklung
│   ├── performance-optimizations.md  # Performance
│   └── production-readiness.md       # Production Checklist
└── screenshots/                      # Projekt Screenshots
```

## 📐 Architektur & Design

### [architecture/](architecture/)

- **[architecture-diagram.md](architecture/architecture-diagram.md)** - Umfassende System-Architektur

  - System-Architektur Übersicht (Client → Backend → Database)
  - Backend Module Struktur (NestJS)
  - Frontend Routing & Module (Angular)
  - Authentifizierung & Autorisierung Flow
  - Deployment & Infrastructure (Docker, CI/CD)
  - Security Layers (JWT, RBAC, Rate Limiting)
  - Data Flow Diagramme
  - Nx Monorepo Dependency Graph

- **[database-erd.md](architecture/database-erd.md)** - Entity-Relationship-Diagramm ⚡ Auto-generiert
  - Vollständiges Datenbank-Schema
  - Alle 8 Tabellen und Beziehungen
  - Foreign Keys und Constraints
  - Enums (UserRole, TicketStatus, etc.)
  - **Aktualisierung:** `cd apps/backend && npx prisma generate`

## 🛠️ Setup & Installation

### [setup/](setup/)

**Erste Schritte:**

1. **[SETUP_ANLEITUNG.md](setup/SETUP_ANLEITUNG.md)** - Vollständige Projekteinrichtung
2. **[DOCKER_SETUP_ANLEITUNG.md](setup/DOCKER_SETUP_ANLEITUNG.md)** - Docker & PostgreSQL
3. **[PRISMA_SETUP_ANLEITUNG.md](setup/PRISMA_SETUP_ANLEITUNG.md)** - Datenbank & Migrations

**Tools & CLI:**

- **[NESTJS_CLI_ANLEITUNG.md](setup/NESTJS_CLI_ANLEITUNG.md)** - NestJS Commands
- **[angular-cli-commands.md](setup/angular-cli-commands.md)** - Angular CLI
- **[angular-material-setup.md](setup/angular-material-setup.md)** - Material Design Setup

**CI/CD & Git:**

- **[GITHUB_ANLEITUNG.md](setup/GITHUB_ANLEITUNG.md)** - GitHub Workflow
- **[ci-cd-setup.md](setup/ci-cd-setup.md)** - CI/CD Pipeline
- **[ci-quickstart.md](setup/ci-quickstart.md)** - Schnellstart

## 💻 Development Guides

### [guides/backend/](guides/backend/) - Backend (NestJS)

**Architektur:**

- **[architecture.md](guides/backend/architecture.md)** - Backend-Architektur Details
- **[MAPPING_STRATEGY.md](guides/backend/MAPPING_STRATEGY.md)** - DTO-Mapping Strategie

**Sicherheit:**

- **[auth/](guides/backend/auth/)** - JWT Authentifizierung & Guards
- **[policy/](guides/backend/policy/)** - Policy-basierte Autorisierung (RBAC)

### [guides/frontend/](guides/frontend/) - Frontend (Angular)

**Struktur & Setup:**

- **[folder-structure.md](guides/frontend/folder-structure.md)** - Ordnerstruktur & Module
- **[layout-integration.md](guides/frontend/layout-integration.md)** - Layout-Integration

**Features:**

- **[label-management.md](guides/frontend/label-management.md)** - Label-Verwaltung
- **[member-management-selection.md](guides/frontend/member-management-selection.md)** - Mitglieder-Verwaltung
- **[project-detail-implementation.md](guides/frontend/project-detail-implementation.md)** - Projekt-Details
- **[project-detail-structure.md](guides/frontend/project-detail-structure.md)** - Projekt-Struktur
- **[ticket-table-implementation.md](guides/frontend/ticket-table-implementation.md)** - Ticket-Tabelle
- **[ticket-view-toggle.md](guides/frontend/ticket-view-toggle.md)** - Ticket-Ansichten
- **[list-view-fixed-rows.md](guides/frontend/list-view-fixed-rows.md)** - List View

**Authentifizierung:**

- **[auth/](guides/frontend/auth/)** - Frontend Auth Guards & Services

### [guides/shared-types/](guides/shared-types/) - Shared Library

- **[shared-types-consistency.md](guides/shared-types/shared-types-consistency.md)** - Type Safety zwischen Frontend/Backend

## 📊 Projekt Management

### [project/](project/)

- **[agents.md](project/agents.md)** - Agent-basierte Entwicklung & AI Tools
- **[performance-optimizations.md](project/performance-optimizations.md)** - Performance Best Practices
- **[production-readiness.md](project/production-readiness.md)** - Production Deployment Checklist

## 🔄 Automatisch Generierte Dokumentation

### Datenbank ERD

Das ERD wird automatisch bei jedem `prisma generate` aktualisiert:

```bash
# Im Backend-Verzeichnis
cd apps/backend
npx prisma generate
```

**Konfiguration:** `apps/backend/prisma/schema.prisma`

```prisma
generator erd {
  provider                  = "prisma-erd-generator"
  output                    = "../../../docs/architecture/database-erd.md"
  includeRelationFromFields = true
}
```

## 🚀 Quick Links

**Projekt READMEs:**

- [📂 Hauptprojekt README](../README.md)
- [🔧 Backend README](../apps/backend/README.md)
- [🎨 Frontend README](../apps/frontend/README.md)
- [📦 Shared Types README](../libs/shared-types/README.md)

**Wichtige Dateien:**

- [📋 CHANGELOG.md](../CHANGELOG.md)
- [🤝 CONTRIBUTING.md](../CONTRIBUTING.md)
- [🔒 SECURITY.md](../SECURITY.md)
- [⚖️ LICENSE](../LICENSE)

## 📝 Dokumentation Pflegen

### Bei Änderungen am Projekt:

| Änderung               | Aktion                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| **Architektur**        | [architecture/architecture-diagram.md](architecture/architecture-diagram.md) aktualisieren |
| **Datenbank Schema**   | `schema.prisma` ändern → `npx prisma generate` ausführen                                   |
| **Setup/Installation** | Entsprechende Anleitungen in [setup/](setup/) aktualisieren                                |
| **Backend Features**   | Guide in [guides/backend/](guides/backend/) hinzufügen/aktualisieren                       |
| **Frontend Features**  | Guide in [guides/frontend/](guides/frontend/) hinzufügen/aktualisieren                     |
| **Performance**        | [project/performance-optimizations.md](project/performance-optimizations.md) erweitern     |

### Best Practices:

✅ **Mermaid Diagramme** für Visualisierungen verwenden  
✅ **Code-Beispiele** mit Syntax-Highlighting  
✅ **Screenshots** im `screenshots/` Ordner ablegen  
✅ **Links** zu verwandten Dokumenten setzen  
✅ **Versionsnummern** und Datum aktualisieren

---

**Projekt:** Issue Tracker Nx Monorepo  
**Version:** 1.0.0  
**Letzte Aktualisierung:** 28. Dezember 2025
