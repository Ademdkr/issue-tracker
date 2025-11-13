# NestJS CLI - Befehlsreferenz für Issue Tracker

## 🎯 Übersicht

Diese Anleitung beschreibt die wichtigsten NestJS CLI-Befehle für die Entwicklung des Issue-Tracker Backends.

---

## 🔧 Installation & Setup

### NestJS CLI installieren

```bash
# Global installieren (empfohlen)
npm install -g @nestjs/cli

# Oder lokal im Projekt
npm install --save-dev @nestjs/cli
```

### CLI-Version prüfen

```bash
nest --version
# oder
nest info
```

---

## 🚀 Resource-Generierung (Hauptbefehl)

### Komplettes Feature-Modul erstellen

```bash
nest generate resource <name>
# oder Kurzform:
nest g resource <name>
```

**Was wird erstellt:**

- `<name>.service.ts` - Business Logic
- `<name>.controller.ts` - API Endpoints
- `<name>.module.ts` - Feature-Modul
- `<name>.entity.ts` - Data Transfer Objects
- Test-Dateien (`*.spec.ts`)

**Interaktive Optionen:**

1. **Transport layer**: REST API, GraphQL, Microservice, WebSockets
2. **CRUD entry points**: Automatische CRUD-Endpoints (ja/nein)

### Beispiele für Issue-Tracker:

```bash
# User-Management
nest g resource users

# Project-Management
nest g resource projects

# Ticket-Management
nest g resource tickets

# Label-System
nest g resource labels

# Comment-System
nest g resource comments
```

---

## 📦 Einzelne Komponenten generieren

### Service erstellen

```bash
nest g service <name>
# Beispiel:
nest g service auth
nest g service email
```

### Controller erstellen

```bash
nest g controller <name>
# Beispiel:
nest g controller health
nest g controller metrics
```

### Module erstellen

```bash
nest g module <name>
# Beispiel:
nest g module database
nest g module config
```

### Provider erstellen

```bash
nest g provider <name>
# Beispiel:
nest g provider logger
nest g provider cache
```

### Guard erstellen

```bash
nest g guard <name>
# Beispiel:
nest g guard auth
nest g guard roles
```

### Interceptor erstellen

```bash
nest g interceptor <name>
# Beispiel:
nest g interceptor logging
nest g interceptor transform
```

### Pipe erstellen

```bash
nest g pipe <name>
# Beispiel:
nest g pipe validation
nest g pipe transform
```

### Filter erstellen

```bash
nest g filter <name>
# Beispiel:
nest g filter http-exception
nest g filter all-exceptions
```

### Decorator erstellen

```bash
nest g decorator <name>
# Beispiel:
nest g decorator user
nest g decorator roles
```

### Middleware erstellen

```bash
nest g middleware <name>
# Beispiel:
nest g middleware logger
nest g middleware cors
```

---

## 🎨 Spezialisierte Generatoren

### Gateway (WebSockets)

```bash
nest g gateway <name>
# Beispiel:
nest g gateway chat
nest g gateway notifications
```

### Library erstellen (Monorepo)

```bash
nest g library <name>
# Beispiel:
nest g library shared
nest g library common
```

### Sub-Application (Monorepo)

```bash
nest g application <name>
# Beispiel:
nest g application api
nest g application worker
```

---

## 📁 Ordnerstruktur & Organisation

### In Unterordnern erstellen

```bash
# Service in Unterordner
nest g service users/auth
nest g service projects/permissions

# Module mit Pfad
nest g module features/analytics
```

### Mit spezifischen Optionen

```bash
# Ohne Test-Dateien
nest g service users --no-spec

# Ohne automatische Module-Registrierung
nest g controller health --no-module

# In einem bestimmten Pfad
nest g service --path=src/shared logger
```

---

## 🔄 Praktische Workflows

### Neue Feature komplett erstellen

```bash
# 1. Resource generieren
nest g resource tickets

# 2. Zusätzliche Services
nest g service tickets/assignment
nest g service tickets/history

# 3. Guards und Middleware
nest g guard tickets/permissions
nest g interceptor tickets/logging

# 4. Pipes für Validierung
nest g pipe tickets/validation
```

### Authentication-System

```bash
# Auth-Modul
nest g module auth

# Services
nest g service auth/auth
nest g service auth/jwt
nest g service auth/local

# Guards
nest g guard auth/jwt
nest g guard auth/local
nest g guard auth/roles

# Strategies
nest g provider auth/jwt-strategy
nest g provider auth/local-strategy
```

### Admin-Dashboard-Features

```bash
# Admin-Modul
nest g resource admin

# Management-Services
nest g service admin/users-management
nest g service admin/projects-management
nest g service admin/analytics

# Admin-spezifische Guards
nest g guard admin/admin-only
```

---

## 🛠️ Nx Monorepo Integration

Da unser Issue-Tracker ein Nx Workspace ist, können auch Nx-Generatoren verwendet werden:

```bash
# NestJS-Service über Nx
nx g @nx/nest:service users --project=backend

# NestJS-Controller über Nx
nx g @nx/nest:controller projects --project=backend

# Komplette Resource über Nx
nx g @nx/nest:resource tickets --project=backend
```

---

## 📋 Nützliche CLI-Optionen

### Verfügbare Generatoren anzeigen

```bash
nest g --help
```

### Trockenlauf (Vorschau ohne Erstellung)

```bash
nest g service users --dry-run
```

### Flache Struktur (keine Unterordner)

```bash
nest g resource users --flat
```

### Ohne Test-Dateien

```bash
nest g service users --no-spec
```

### Vorhandene Dateien überschreiben

```bash
nest g service users --force
```

---

## 🎯 Best Practices für Issue-Tracker

### Empfohlene Module-Struktur:

```
src/app/
├── users/           # nest g resource users
├── projects/        # nest g resource projects
├── tickets/         # nest g resource tickets
├── labels/          # nest g resource labels
├── comments/        # nest g resource comments
├── auth/           # nest g module auth
├── shared/         # nest g module shared
└── common/         # Shared utilities
```

### Zusätzliche Services:

```bash
# Email-System
nest g service notifications/email

# File Upload
nest g service uploads/files

# Caching
nest g service cache/redis

# Logging
nest g service logging/winston
```

### Security-Layer:

```bash
# Authentication
nest g guard auth/jwt
nest g guard auth/local

# Authorization
nest g guard roles/admin
nest g guard roles/project-member

# Input Validation
nest g pipe validation/joi
nest g pipe transform/sanitize
```

---

## 🚨 Wichtige Hinweise

### Vor der Generierung:

1. **Arbeitsverzeichnis**: Immer im Backend-Ordner arbeiten (`cd apps/backend`)
2. **Module-Import**: Neue Module müssen in `app.module.ts` importiert werden
3. **Prisma Integration**: Services müssen PrismaService injizieren

### Nach der Generierung:

1. **Prisma-Integration** hinzufügen
2. **DTOs** an Projektanforderungen anpassen
3. **Routing** testen
4. **Module-Abhängigkeiten** prüfen

### Typische Anpassungen:

```typescript
// In generierten Services
constructor(private prisma: PrismaService) {}

// In generierten Controllern
@ApiTags('users')  // Swagger-Tags
@UseGuards(JwtAuthGuard)  // Authentication
```

---

## 📚 Weiterführende Ressourcen

- **NestJS Dokumentation**: https://docs.nestjs.com/
- **CLI Referenz**: https://docs.nestjs.com/cli/overview
- **Nx NestJS Plugin**: https://nx.dev/nx-api/nest

---

**Erstellt am**: 12. November 2025  
**Für Projekt**: Issue-Tracker Backend  
**CLI Version**: @nestjs/cli@latest
