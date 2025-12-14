# Angular CLI Befehle

**Datum:** 17. November 2025  
**Projekt:** Issue Tracker (Nx Monorepo)

## Übersicht

Nützliche Angular CLI Befehle für die Entwicklung im Frontend-Projekt.

---

## 🚀 Component Generation

### Component mit HTML, SCSS und TS

> **⚠️ Wichtig:** Ab Nx v22+ ist das `--project` Flag deprecated. Verwende stattdessen direkte Pfade.

> **ℹ️ Dateinamen:** Nx v22+ generiert `component.ts` statt `component.component.ts`. Für das klassische Angular-Pattern musst du Dateien manuell umbenennen.

```bash
# Standalone Component generieren (Empfohlene Syntax)
npx nx g @nx/angular:component <path>/<component-name> --style=scss --standalone

# Component in spezifischem Ordner
npx nx g @nx/angular:component features/auth/register --style=scss --standalone

# Component mit Inline-Template und Styles
npx nx g @nx/angular:component <component-name> --inline-template --inline-style --standalone

# Component OHNE Test-Datei
npx nx g @nx/angular:component <component-name> --style=scss --skip-tests --standalone
```

**Für klassisches Angular-Pattern (`*.component.*`):**

```bash
# Nach der Generierung manuell umbenennen:
cd apps/frontend/src/app/core/layout
Rename-Item layout.ts layout.component.ts
Rename-Item layout.scss layout.component.scss
Rename-Item layout.html layout.component.html
Rename-Item layout.spec.ts layout.component.spec.ts

# Dann in layout.component.ts anpassen:
# - Klassenname: Layout → LayoutComponent
# - templateUrl: './layout.html' → './layout.component.html'
# - styleUrl: './layout.scss' → './layout.component.scss'
```

### Beispiele:

```bash
# Login Component (bereits erstellt)
npx nx g @nx/angular:component features/auth/login --standalone

# Project List Component
npx nx g @nx/angular:component features/projects/project-list --standalone

# Ticket Card Component
npx nx g @nx/angular:component features/tickets/ticket-card --standalone

# Shared Button Component
npx nx g @nx/angular:component shared/ui/button --standalone

# Layout Component mit vollständigem Pfad
npx nx g @nx/angular:component --name=layout --directory=apps/frontend/src/app/core/layout --standalone
```

**Generierte Dateien:**

```
component-name/
├── component-name.component.ts
├── component-name.component.html
├── component-name.component.scss
└── component-name.component.spec.ts (optional)
```

---

## 🔧 Service Generation

### Service erstellen

```bash
# Service generieren
npx nx generate @nx/angular:service core/services/<service-name>

# Service OHNE Test-Datei
npx nx generate @nx/angular:service core/services/<service-name> --skip-tests
```

### Beispiele:

```bash
# Auth Service (bereits erstellt)
npx nx g @nx/angular:service core/services/auth

# Project Service
npx nx g @nx/angular:service core/services/project

# Ticket Service
npx nx g @nx/angular:service core/services/ticket
```

**Generierte Dateien:**

```
<service-name>.service.ts
<service-name>.service.spec.ts (optional)
```

---

## 🛡️ Guard Generation

### Guard erstellen

```bash
# Functional Guard (Angular 14+)
npx nx generate @nx/angular:guard core/guards/<guard-name> --functional

# Class-based Guard (Legacy)
npx nx generate @nx/angular:guard core/guards/<guard-name>
```

### Beispiele:

```bash
# Auth Guard (bereits erstellt)
npx nx g @nx/angular:guard core/guards/auth --functional

# Admin Guard
npx nx g @nx/angular:guard core/guards/admin --functional

# Role Guard
npx nx g @nx/angular:guard core/guards/role --functional
```

---

## 🔄 Interceptor Generation

### Interceptor erstellen

```bash
# Functional Interceptor (Angular 14+)
npx nx generate @nx/angular:interceptor core/interceptors/<interceptor-name> --functional

# Class-based Interceptor (Legacy)
npx nx generate @nx/angular:interceptor core/interceptors/<interceptor-name>
```

### Beispiele:

```bash
# JWT Interceptor (bereits erstellt)
npx nx g @nx/angular:interceptor core/interceptors/jwt --functional

# Error Interceptor (bereits erstellt)
npx nx g @nx/angular:interceptor core/interceptors/error --functional

# Loading Interceptor
npx nx g @nx/angular:interceptor core/interceptors/loading --functional
```

---

## 📦 Module Generation

### Module erstellen (falls nicht standalone)

```bash
# Feature Module
npx nx generate @nx/angular:module features/<module-name> --routing

# Shared Module
npx nx generate @nx/angular:module shared/<module-name>
```

---

## 🎨 Directive & Pipe Generation

### Directive erstellen

```bash
# Standalone Directive
npx nx g @nx/angular:directive shared/directives/<directive-name> --standalone

# Beispiel: Highlight Directive
npx nx g @nx/angular:directive shared/directives/highlight --standalone
```

### Pipe erstellen

```bash
# Standalone Pipe
npx nx g @nx/angular:pipe shared/pipes/<pipe-name> --standalone

# Beispiel: Date Format Pipe
npx nx g @nx/angular:pipe shared/pipes/date-format --standalone
```

---

## 🧪 Testing

### Tests ausführen

```bash
# Alle Frontend-Tests
npx nx test frontend

# Tests im Watch-Mode
npx nx test frontend --watch

# Tests mit Code-Coverage
npx nx test frontend --code-coverage

# Spezifische Test-Datei
npx nx test frontend --include='**/login.component.spec.ts'
```

### E2E Tests

```bash
# Cypress E2E Tests
npx nx e2e frontend-e2e

# Cypress in interaktivem Modus
npx nx e2e frontend-e2e --watch
```

---

## 🏗️ Build & Serve

### Development Server

```bash
# Frontend starten (Port 4200)
npx nx serve frontend

# Mit spezifischem Port
npx nx serve frontend --port 4201

# Mit SSL
npx nx serve frontend --ssl

# Mit Proxy-Konfiguration
npx nx serve frontend --proxy-config proxy.conf.json
```

### Production Build

```bash
# Production Build
npx nx build frontend

# Build mit Source Maps
npx nx build frontend --source-map

# Build mit Analyzer
npx nx build frontend --stats-json
npx webpack-bundle-analyzer dist/apps/frontend/stats.json
```

---

## 📊 Code Analysis

### Linting

```bash
# Lint Frontend
npx nx lint frontend

# Lint mit Auto-Fix
npx nx lint frontend --fix
```

### Dependency Graph

```bash
# Zeige Dependency Graph
npx nx graph

# Zeige betroffene Projekte
npx nx affected:graph
```

---

## 🔄 Migration & Updates

### Nx & Angular Updates

```bash
# Nx Workspace aktualisieren
npx nx migrate latest

# Migrationen ausführen
npx nx migrate --run-migrations

# Angular aktualisieren
npx nx migrate @nx/angular@latest
```

---

## 📁 Projekt-Struktur Generierung

### Feature-Module mit Components

```bash
# Feature-Ordner erstellen
mkdir -p apps/frontend/src/app/features/<feature-name>

# Components generieren
npx nx generate @nx/angular:component features/<feature-name>/<component-name> --project=frontend --standalone

# Service für Feature
npx nx generate @nx/angular:service features/<feature-name>/services/<service-name> --project=frontend
```

### Beispiel: Tickets Feature

```bash
# Ticket List Component
npx nx generate @nx/angular:component features/tickets/ticket-list --project=frontend --standalone

# Ticket Detail Component
npx nx generate @nx/angular:component features/tickets/ticket-detail --project=frontend --standalone

# Ticket Form Component
npx nx generate @nx/angular:component features/tickets/ticket-form --project=frontend --standalone

# Ticket Service
npx nx generate @nx/angular:service features/tickets/services/ticket --project=frontend
```

---

## 🎯 Praktische Shortcuts

### Component + Service gleichzeitig

```bash
# Feature mit Component und Service
FEATURE="projects"
npx nx g @nx/angular:component features/$FEATURE/$FEATURE-list --standalone
npx nx g @nx/angular:service features/$FEATURE/services/$FEATURE
```

### Vollständiges Feature Setup

```bash
#!/bin/bash
FEATURE="tickets"

# Components
npx nx g @nx/angular:component features/$FEATURE/$FEATURE-list --standalone
npx nx g @nx/angular:component features/$FEATURE/$FEATURE-detail --standalone
npx nx g @nx/angular:component features/$FEATURE/$FEATURE-form --standalone

# Service
npx nx g @nx/angular:service features/$FEATURE/services/$FEATURE

# Models (manuell erstellen oder aus shared-types importieren)
mkdir -p apps/frontend/src/app/features/$FEATURE/models
```

---

## 🔍 Hilfreiche Flags

### Häufig verwendete Flags:

| Flag                | Beschreibung                              | Beispiel            |
| ------------------- | ----------------------------------------- | ------------------- |
| `--standalone`      | Erstellt Standalone Component (empfohlen) | `--standalone`      |
| `--skip-tests`      | Keine Test-Datei generieren               | `--skip-tests`      |
| `--inline-template` | Template inline in TS-Datei               | `--inline-template` |
| `--inline-style`    | Styles inline in TS-Datei                 | `--inline-style`    |
| `--flat`            | Keine eigener Ordner für Component        | `--flat`            |
| `--dry-run`         | Zeigt Änderungen ohne auszuführen         | `--dry-run`         |
| `--prefix`          | Custom Component Selector Prefix          | `--prefix=it`       |
| `--export`          | Exportiert aus Module                     | `--export`          |

### Dry-Run Modus (Vorschau)

```bash
# Zeige was generiert würde, OHNE Dateien zu erstellen
npx nx g @nx/angular:component features/projects/project-card --standalone --dry-run
```

---

## 📚 Angular Material Components generieren

### Material Schematics

```bash
# Navigation Component mit Sidenav
npx nx generate @angular/material:navigation core/layout/nav

# Dashboard Layout
npx nx generate @angular/material:dashboard features/dashboard

# Table Component
npx nx generate @angular/material:table features/projects/project-table

# Address Form
npx nx generate @angular/material:address-form features/users/user-form
```

---

## 🎨 Style-Management

### SCSS Dateien generieren

```bash
# Globale SCSS Variablen
touch apps/frontend/src/styles/_variables.scss

# Theme Overrides
touch apps/frontend/src/styles/_theme.scss

# Component-spezifische Styles
# Werden automatisch bei Component-Generation erstellt
```

---

## ⚡ Performance-Optimierung

### Bundle Analyzer

```bash
# Build mit Stats-JSON
npx nx build frontend --stats-json

# Bundle analysieren (webpack-bundle-analyzer installieren)
npm install -D webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/apps/frontend/stats.json
```

### Lazy Loading Setup

```typescript
// In app.routes.ts
export const appRoutes: Route[] = [
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/project-list/project-list.component').then((m) => m.ProjectListComponent),
  },
];
```

---

## 🛠️ Nx-spezifische Befehle

### Affected Commands (nur geänderte Apps)

```bash
# Nur betroffene Tests ausführen
npx nx affected:test

# Nur betroffene Apps bauen
npx nx affected:build

# Nur betroffene Apps linting
npx nx affected:lint

# Betroffene Projekte anzeigen
npx nx affected:apps
npx nx affected:libs
```

### Cache Management

```bash
# Cache löschen
npx nx reset

# Cache-Status anzeigen
npx nx show project frontend --web
```

---

## 📖 Referenzen

- [Nx Angular Generators](https://nx.dev/nx-api/angular/generators/application)
- [Angular CLI Schematics](https://angular.io/cli/generate)
- [Angular Material Schematics](https://material.angular.io/guide/schematics)
- [Nx Documentation](https://nx.dev)

---

## 💡 Best Practices

### Component-Generierung:

1. **Immer `--standalone` verwenden** (Angular 14+)
2. **Strukturierte Ordner:** `features/<feature>/<component>`
3. **Tests generieren:** Nur `--skip-tests` bei Prototyping
4. **Dry-Run nutzen:** Erst Vorschau mit `--dry-run`

### Naming Conventions:

```bash
# Components: kebab-case
npx nx g @nx/angular:component features/tickets/ticket-card

# Services: kebab-case
npx nx g @nx/angular:service core/services/auth

# Guards: kebab-case
npx nx g @nx/angular:guard core/guards/auth

# Pipes: kebab-case
npx nx g @nx/angular:pipe shared/pipes/date-format
```

### Projekt-Struktur:

```
apps/frontend/src/app/
├── core/                 # Singleton Services, Guards, Interceptors
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── features/            # Feature-Module (Lazy Loaded)
│   ├── auth/
│   ├── projects/
│   └── tickets/
└── shared/              # Gemeinsame Components, Pipes, Directives
    ├── components/
    ├── directives/
    └── pipes/
```

---

**Tipp:** Nutze `npx nx list` um alle verfügbaren Generatoren zu sehen!
