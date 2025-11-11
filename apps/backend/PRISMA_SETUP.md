# Prisma Setup für das Issue-Tracker Backend

## Installation

Prisma wurde erfolgreich im Backend installiert mit folgenden Komponenten:

### Dependencies
- `prisma` - Prisma CLI und Entwicklungstools
- `@prisma/client` - TypeScript/JavaScript Client für Datenbankoperationen
- `dotenv` - Zum Laden von Umgebungsvariablen

### Datenbankmodell

Das Issue-Tracker-System verwendet folgende Datenbankstruktur:

```prisma
model Issue {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(OPEN)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("issues")
}

enum Status {
  OPEN
  IN_PROGRESS
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### Services

1. **PrismaService** (`src/app/prisma.service.ts`)
   - Verwaltet die Datenbankverbindung
   - Implementiert NestJS Lifecycle-Hooks für saubere Verbindungsschließung

2. **IssuesService** (`src/app/issues.service.ts`)
   - CRUD-Operationen für Issues
   - Methoden: `createIssue`, `findAllIssues`, `findIssueById`, `updateIssue`, `deleteIssue`

### Datenbank

- **Provider**: SQLite (für Entwicklung)
- **Datei**: `apps/backend/prisma/dev.db`
- **Migration**: Initial-Migration wurde erfolgreich angewendet

## Verwendung

### Prisma CLI Commands

```bash
# Client generieren
npx prisma generate

# Migrations ausführen
npx prisma migrate dev

# Datenbank zurücksetzen
npx prisma migrate reset

# Prisma Studio (GUI)
npx prisma studio

# Datenbankschema aktualisieren (ohne Migration)
npx prisma db push
```

### NestJS Integration

Der PrismaService und IssuesService sind im AppModule registriert und können in Controllern injiziert werden:

```typescript
constructor(private issuesService: IssuesService) {}
```

## Nächste Schritte

1. **Controller erstellen** - REST API Endpoints für Issues
2. **Validierung** - DTOs für Request/Response Validierung
3. **Tests** - Unit und Integration Tests
4. **Produktions-DB** - PostgreSQL für Production Environment
5. **Migrations** - Automatische Migrations in CI/CD Pipeline

## Struktur

```
apps/backend/
├── prisma/
│   ├── migrations/
│   │   └── 20251111130405_init/
│   ├── dev.db
│   └── schema.prisma
├── src/app/
│   ├── app.module.ts
│   ├── prisma.service.ts
│   └── issues.service.ts
└── .env
```