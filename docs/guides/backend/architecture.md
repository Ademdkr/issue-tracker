# Backend Architecture

## 🏗️ System-Architektur

```mermaid
graph TB
    subgraph "Client Layer"
        Angular[Angular Frontend<br/>Port 4200]
    end

    subgraph "API Gateway"
        NestJS[NestJS Application<br/>Port 3000]
        Swagger[Swagger UI<br/>/api/docs]
    end

    subgraph "Authentication Layer"
        JWT[JWT Strategy]
        Guards[Auth Guards<br/>- JwtAuthGuard<br/>- RolesGuard]
        Policies[Policy Handlers<br/>RBAC Logic]
    end

    subgraph "Business Logic Layer"
        AuthModule[Auth Module<br/>Login/Register]
        UsersModule[Users Module<br/>User Management]
        ProjectsModule[Projects Module<br/>CRUD + Members]
        TicketsModule[Tickets Module<br/>Issue Management]
        CommentsModule[Comments Module<br/>Discussions]
        LabelsModule[Labels Module<br/>Categorization]
        ActivitiesModule[Activities Module<br/>Audit Trail]
    end

    subgraph "Data Access Layer"
        Prisma[Prisma ORM]
        PrismaService[Prisma Service<br/>DB Connection]
    end

    subgraph "Database"
        PostgreSQL[(PostgreSQL<br/>Port 5432)]
    end

    Angular -->|HTTP/REST| NestJS
    NestJS --> Swagger
    NestJS --> Guards
    Guards --> JWT
    Guards --> Policies

    NestJS --> AuthModule
    NestJS --> UsersModule
    NestJS --> ProjectsModule
    NestJS --> TicketsModule
    NestJS --> CommentsModule
    NestJS --> LabelsModule
    NestJS --> ActivitiesModule

    AuthModule --> PrismaService
    UsersModule --> PrismaService
    ProjectsModule --> PrismaService
    TicketsModule --> PrismaService
    CommentsModule --> PrismaService
    LabelsModule --> PrismaService
    ActivitiesModule --> PrismaService

    PrismaService --> Prisma
    Prisma --> PostgreSQL
```

## 📁 Modul-Struktur

```
apps/backend/src/
├── app/
│   ├── auth/              # Authentifizierung & Authorization
│   │   ├── services/      # AuthService, JwtStrategy
│   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   ├── policies/      # Policy Handlers (RBAC)
│   │   └── decorators/    # Custom Decorators
│   ├── users/             # Benutzerverwaltung
│   ├── projects/          # Projektverwaltung
│   ├── tickets/           # Ticket/Issue Management
│   ├── comments/          # Kommentarsystem
│   ├── labels/            # Label-Verwaltung
│   ├── ticket-activities/ # Aktivitätsverfolgung
│   ├── dashboard/         # Dashboard-Statistiken
│   ├── health/            # Health Checks
│   ├── database/          # Prisma Service
│   └── core/              # App Module, Global Config
├── main.ts                # Bootstrap & Swagger Config
└── prisma/
    ├── schema.prisma      # Datenbank-Schema
    ├── migrations/        # Migration History
    └── seed.ts            # Seed Data
```

## 🔐 Authentifizierung & Authorization

### 1. JWT-basierte Authentifizierung

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant Database
    participant JwtService

    Client->>AuthController: POST /auth/login<br/>{email, password}
    AuthController->>AuthService: login()
    AuthService->>Database: findUnique(email)
    Database-->>AuthService: User
    AuthService->>AuthService: bcrypt.compare(password)
    AuthService->>JwtService: sign(payload)
    JwtService-->>AuthService: access_token
    AuthService-->>AuthController: {access_token, user}
    AuthController-->>Client: LoginResponse

    Note over Client: Store token in localStorage

    Client->>AuthController: GET /tickets<br/>Authorization: Bearer <token>
    AuthController->>JwtService: verify(token)
    JwtService-->>AuthController: payload
    AuthController->>Database: findUnique(userId)
    Database-->>AuthController: User
    AuthController-->>Client: Tickets[]
```

### 2. RBAC (Role-Based Access Control)

| Rolle         | Beschreibung    | Berechtigungen                                                                                                |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Reporter**  | Basis-Nutzer    | - Tickets erstellen (nur title/description)<br/>- Eigene Tickets bearbeiten<br/>- Kommentare schreiben        |
| **Developer** | Entwickler      | - Reporter Rechte +<br/>- Tickets sich selbst zuweisen<br/>- Priorität setzen<br/>- Status ändern             |
| **Manager**   | Projekt-Manager | - Developer Rechte +<br/>- Tickets anderen zuweisen<br/>- Projekt-Mitglieder verwalten<br/>- Labels verwalten |
| **Admin**     | System-Admin    | - Alle Rechte<br/>- User-Verwaltung<br/>- Projekt slug ändern                                                 |

### 3. Policy-basierte Authorization

```typescript
// Beispiel: UpdateTicketPolicy
@Injectable()
export class UpdateTicketPolicyHandler {
  canUpdate(user: User, ticket: Ticket): boolean {
    // Admin: Alle Rechte
    if (user.role === UserRole.ADMIN) return true;

    // Reporter: Nur eigene Tickets
    if (user.role === UserRole.REPORTER) {
      return ticket.reporterId === user.id;
    }

    // Developer/Manager: Eigene + zugewiesene
    return ticket.reporterId === user.id || ticket.assigneeId === user.id;
  }
}
```

## 💾 Datenbank-Schema

```mermaid
erDiagram
    User ||--o{ ProjectMember : "member of"
    User ||--o{ Ticket : "reports"
    User ||--o{ Ticket : "assigned to"
    User ||--o{ Comment : "writes"
    User ||--o{ TicketActivity : "creates"

    Project ||--o{ ProjectMember : "has"
    Project ||--o{ Ticket : "contains"
    Project ||--o{ Label : "defines"

    Ticket ||--o{ Comment : "has"
    Ticket ||--o{ TicketActivity : "tracks"
    Ticket ||--o{ TicketLabel : "tagged with"

    Label ||--o{ TicketLabel : "applied to"

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        string surname
        UserRole role
        datetime createdAt
    }

    Project {
        string id PK
        string name
        string description
        string slug UK
        datetime createdAt
    }

    ProjectMember {
        string id PK
        string projectId FK
        string userId FK
        datetime assignedAt
    }

    Ticket {
        string id PK
        string projectId FK
        string reporterId FK
        string assigneeId FK
        string title
        string description
        TicketStatus status
        TicketPriority priority
        datetime createdAt
        datetime updatedAt
    }

    Label {
        string id PK
        string projectId FK
        string name UK
        string color
        datetime createdAt
    }

    Comment {
        string id PK
        string ticketId FK
        string userId FK
        string content
        datetime createdAt
        datetime updatedAt
    }

    TicketActivity {
        string id PK
        string ticketId FK
        string userId FK
        ActivityType type
        json detail
        datetime createdAt
    }
```

## 🔄 Request Lifecycle

```mermaid
graph LR
    A[Client Request] --> B[CORS Middleware]
    B --> C[Global Validation Pipe]
    C --> D[Controller Route]
    D --> E{Authentication<br/>Required?}
    E -->|Yes| F[JwtAuthGuard]
    E -->|No| H[Service Layer]
    F --> G{Authorized?}
    G -->|Yes| H
    G -->|No| I[401 Unauthorized]
    H --> J[Prisma Service]
    J --> K[(Database)]
    K --> L[Response Mapping]
    L --> M[Client Response]
```

## 🛡️ Security Features

### Input Validation

- **ValidationPipe** mit `class-validator` DTOs
- **Whitelist**: Unbekannte Properties werden entfernt
- **Transform**: Automatische Type Conversion

### Authentication

- **bcrypt** für Password Hashing (Salting + 10 Rounds)
- **JWT** mit 512-bit Secret (HS256 Algorithm)
- **Token Expiration**: 1 Stunde Access Token

### Authorization

- **Guards**: Route-Level Protection
- **Policies**: Business-Logic-Level Authorization
- **RBAC**: Rollenbasierte Zugriffskontrolle

### CORS

- **Allowed Origins**: Whitelist für Frontend-URLs
- **Credentials**: Cookie/Auth Header Support
- **Methods**: Nur benötigte HTTP-Methoden

### Rate Limiting

- **100 Requests/Minute** pro IP
- Schutz vor DDoS und Brute-Force

## 📊 API-Dokumentation

Die vollständige API-Dokumentation ist via Swagger UI verfügbar:

**Development:**

```
http://localhost:3000/api/docs
```

**Features:**

- ✅ Interaktive API-Exploration
- ✅ Request/Response Schemas
- ✅ JWT-Authentication Testing
- ✅ Try-it-out Funktionalität
- ✅ Modell-Definitionen

## 🚀 Performance-Optimierungen

### Database

- **Connection Pooling** via Prisma (max 10 Connections)
- **Query Optimization** mit Prisma `select` und `include`
- **Indizes** auf häufig verwendete Felder (email, slug, projectId, etc.)

### Caching

- **JWT Payload** wird nicht bei jedem Request validiert (stateless)
- **Prisma Query Engine** cached Prepared Statements

### Logging

- **Production**: Nur errors, warnings, logs
- **Development**: Full debug output
- **Structured Logging** für bessere Filterbarkeit

## 🏥 Health Checks

```typescript
GET /api/health
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

## 🔧 Entwicklung

Siehe [Backend README](../../apps/backend/README.md) für Setup-Instruktionen.

## 📚 Weitere Dokumentation

- [Auth Guards](./guides/backend/auth/authentication-guards.md)
- [JWT Implementation](./guides/backend/auth/jwt-implementation-guide.md)
- [Policy System](./guides/backend/policy/policy-system-implementation.md)
- [Mapping Strategy](./guides/backend/MAPPING_STRATEGY.md)
