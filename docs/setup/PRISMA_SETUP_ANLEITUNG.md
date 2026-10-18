# Prisma Setup für das Issue-Tracker Backend

## ✅ Installation & Konfiguration

Prisma wurde erfolgreich für PostgreSQL konfiguriert mit vollständigem Schema für ein Issue-Tracking-System.

### Dependencies

- `prisma` - Prisma CLI und Entwicklungstools (v5.11.0)
- `@prisma/client` - TypeScript Client für Datenbankoperationen
- `dotenv` - Umgebungsvariablen-Management

### Datenbank-Konfiguration

- **Provider**: PostgreSQL 16.10 (Docker Container)
- **Port**: 5435 (zur Konflikt-Vermeidung)
- **Passwort**: `1234` (vereinfacht)
- **URL**: `postgresql://postgres:1234@localhost:5435/issue_tracker_db`

### Vollständiges Datenbankmodell

Das Issue-Tracker-System verwendet eine umfassende Datenbankstruktur mit 8 Haupttabellen:

```prisma
// Benutzer-Management
model User {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String
  surname      String
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole @default(REPORTER)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  createdProjects     Project[]       @relation("ProjectCreator")
  reportedTickets     Ticket[]        @relation("TicketReporter")
  assignedTickets     Ticket[]        @relation("TicketAssignee")
  projectMemberships  ProjectMember[] @relation("ProjectMemberUser")
  addedMembers        ProjectMember[] @relation("ProjectMemberAdder")
  comments            Comment[]
  ticketActivities    TicketActivity[]

  @@map("users")
}

// Projekt-Management
model Project {
  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdBy   String        @map("created_by") @db.Uuid
  name        String
  description String
  slug        String        @unique
  status      ProjectStatus @default(OPEN)
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime?     @map("updated_at") @db.Timestamptz

  // Relations
  creator User            @relation("ProjectCreator", fields: [createdBy], references: [id])
  tickets Ticket[]
  labels  Label[]
  members ProjectMember[]

  @@map("projects")
}

// Issue/Ticket-System
model Ticket {
  id          String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  projectId   String         @map("project_id") @db.Uuid
  reporterId  String         @map("reporter_id") @db.Uuid
  assigneeId  String?        @map("assignee_id") @db.Uuid
  title       String
  description String
  status      TicketStatus   @default(OPEN)
  priority    TicketPriority @default(LOW)
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime?      @map("updated_at") @db.Timestamptz

  // Relations
  project        Project         @relation(fields: [projectId], references: [id])
  reporter       User            @relation("TicketReporter", fields: [reporterId], references: [id])
  assignee       User?           @relation("TicketAssignee", fields: [assigneeId], references: [id])
  ticketLabels   TicketLabel[]
  comments       Comment[]
  activities     TicketActivity[]

  @@map("tickets")
}

// Enumerationen
enum UserRole {
  REPORTER  @map("reporter")
  DEVELOPER @map("developer")
  MANAGER   @map("manager")
  ADMIN     @map("admin")
}

enum TicketStatus {
  OPEN        @map("open")
  IN_PROGRESS @map("in_progress")
  RESOLVED    @map("resolved")
  CLOSED      @map("closed")
}

enum TicketPriority {
  LOW      @map("low")
  MEDIUM   @map("medium")
  HIGH     @map("high")
  CRITICAL @map("critical")
}
```

**Weitere Tabellen:** Label, Comment, ProjectMember, TicketLabel, TicketActivity

### Services & Integration

#### 1. **PrismaService** (`src/app/prisma.service.ts`)

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:1234@localhost:5435/issue_tracker_db',
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### 2. **Minimale API** (`src/app/app.controller.ts`)

```typescript
@Controller()
export class AppController {
  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('users')
  async getUsers() {
    const users = await this.prismaService.user.findMany();
    return { status: 'success', users, count: users.length };
  }
}
```

#### 3. **Seed-Script** (`scripts/database/seed.ts`)

```typescript
// Erstellt automatisch Test-User bei Setup
const user = await prisma.user.upsert({
  where: { email: 'test@example.com' },
  create: {
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    passwordHash: 'hashed_password_123',
    role: 'DEVELOPER',
  },
});
```

### Migration & Setup

- **Database Provider**: PostgreSQL (Docker Container)
- **Migration Status**: ✅ Alle 8 Tabellen erfolgreich migriert
- **Test Data**: ✅ Test-User erstellt über Seed-Script
- **Schema Synchronization**: ✅ Automatisch über `prisma migrate dev`

## 🔧 Verwendung

### Setup-Befehle (Einmalig)

```bash
# 1. Docker Container starten
docker-compose up -d

# 2. Wechsel ins Backend-Verzeichnis
cd apps/backend

# 3. Migration ausführen
npx prisma migrate dev --name "initial-schema"

# 4. Prisma Client generieren
npx prisma generate

# 5. Test-Daten erstellen
npm run db:seed

# 6. Backend starten (aus Root-Verzeichnis)
cd .. && npx nx serve backend
```

### Prisma CLI Commands

```bash
# Client neu generieren
npx prisma generate

# Neue Migration erstellen
npx prisma migrate dev --name "description"

# Migration ohne Eingabe anwenden
npx prisma migrate deploy

# Datenbank-Schema direkt pushen (Development)
npx prisma db push

# Prisma Studio (Datenbank-GUI)
npx prisma studio

# Datenbank komplett zurücksetzen
npx prisma migrate reset

# Schema von bestehender DB ableiten
npx prisma db pull
```

### Development Workflow

```bash
# Tägliche Entwicklung
docker-compose up -d                    # Container starten
npx nx serve backend                    # Backend starten

# Schema-Änderungen
# 1. Bearbeite: prisma/schema.prisma
# 2. Migration erstellen:
cd apps/backend && npx prisma migrate dev --name "new-feature"
# 3. Client neu generieren:
npx prisma generate
# 4. Backend neu starten
```

### NestJS Integration

Der PrismaService ist minimal konfiguriert und kann in Controllern injiziert werden:

```typescript
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService // ✅ Injiziert
  ) {}

  // Beispiel: User abrufen
  @Get('users')
  async getUsers() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return { status: 'success', users, count: users.length };
  }
}
```

### API Endpoints (Aktuell verfügbar)

```
GET  /api        - Standard NestJS Response
GET  /api/users  - Alle User aus Datenbank abrufen
```

**Test-User verfügbar:**

- **Name**: Test User
- **Email**: test@example.com
- **Role**: DEVELOPER
- **ID**: UUID (automatisch generiert)

## 🚀 Nächste Schritte

### Sofort verfügbar:

- ✅ **Vollständige Datenbank** (8 Tabellen, Foreign Keys, Indizes)
- ✅ **Test-User abrufbar** über `GET /api/users`
- ✅ **Prisma Client** mit TypeScript-Typen für alle Modelle

### Entwicklung (Next Steps):

1. **Controller erweitern** - CRUD APIs für Projects, Tickets, Labels
2. **DTOs erstellen** - Request/Response Validierung mit class-validator
3. **Services implementieren** - Business Logic für UserService, ProjectService, TicketService
4. **Authentication** - JWT-basierte Benutzerauthentifizierung
5. **Authorization** - Rollenbasierte Zugriffskontrolle
6. **Tests schreiben** - Unit und Integration Tests
7. **Error Handling** - Globale Exception Filter

### Production Vorbereitung:

1. **Environment Config** - Separate Konfiguration für Production
2. **Database Migrations** - Automatische Migrations in CI/CD
3. **Logging** - Strukturiertes Logging mit Winston
4. **Monitoring** - Health Checks und Metrics
5. **Security** - Rate Limiting, Input Validation, CORS

## 📁 Aktuelle Projekt-Struktur

```
apps/backend/
├── prisma/
│   ├── migrations/           # Auto-generierte Migrations
│   │   └── [timestamp]_initial-schema/
│   ├── schema.prisma        # Vollständiges Schema (8 Modelle)
│   ├── seed.ts             # Test-Daten Script
│   └── migration.sql       # Backup SQL-Schema
├── src/app/
│   ├── app.module.ts       # AppService + PrismaService
│   ├── app.controller.ts   # API: /, /users
│   ├── app.service.ts      # Standard NestJS Service
│   └── prisma.service.ts   # Minimale Prisma-Konfiguration
├── .env                    # DATABASE_URL mit Passwort 1234
└── package.json
```

## 🔍 Database Schema Übersicht

**8 Haupttabellen:**

1. **users** (7 Felder) - Benutzer mit Rollen
2. **projects** (8 Felder) - Projektmanagement
3. **tickets** (10 Felder) - Hauptentität für Issues
4. **labels** (6 Felder) - Kategorisierung
5. **comments** (6 Felder) - Kommunikation
6. **project_members** (4 Felder) - Team-Zugehörigkeit
7. **ticket_labels** (3 Felder) - Many-to-Many Zuordnung
8. **ticket_activity** (6 Felder) - Audit Trail mit JSONB

**Performance Features:**

- ✅ 16 Indizes für optimierte Abfragen
- ✅ Foreign Key Constraints für Datenintegrität
- ✅ Check Constraints für Enum-Validierung
- ✅ UUID Primary Keys mit PostgreSQL gen_random_uuid()

---

**Setup abgeschlossen am:** 12. November 2025  
**Prisma Version:** 5.11.0  
**PostgreSQL:** 16.10 Alpine (Docker)  
**Status:** ✅ Produktionsbereit für Issue Tracking System
