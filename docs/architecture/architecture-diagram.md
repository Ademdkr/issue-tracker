# Issue Tracker - Architekturdiagramm

## 🏗️ System-Architektur Übersicht

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Angular[Angular 20.3 SPA]
    end

    subgraph "Nx Monorepo Workspace"
        subgraph "Frontend App"
            AuthModule[Auth Module]
            DashboardModule[Dashboard Module]
            ProjectsModule[Projects Module]
            TicketsModule[Tickets Module]
            SharedModule[Shared Module]
        end

        subgraph "Backend App"
            AuthAPI[Auth Controller]
            UsersAPI[Users Controller]
            ProjectsAPI[Projects Controller]
            TicketsAPI[Tickets Controller]
            CommentsAPI[Comments Controller]
            LabelsAPI[Labels Controller]
            DashboardAPI[Dashboard Controller]
        end

        subgraph "Shared Library"
            SharedTypes[Shared Types Library]
        end
    end

    subgraph "Backend Services Layer"
        AuthService[Auth Service]
        UsersService[Users Service]
        ProjectsService[Projects Service]
        TicketsService[Tickets Service]
        CommentsService[Comments Service]
        PolicyService[Policy Service]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL Database)]
    end

    subgraph "Security & Middleware"
        JWTGuard[JWT Guard]
        RateLimiter[Rate Limiter]
        CORS[CORS Config]
        ValidationPipe[Validation Pipe]
    end

    Browser --> Angular
    Angular --> AuthModule
    Angular --> DashboardModule
    Angular --> ProjectsModule
    Angular --> TicketsModule
    Angular --> SharedModule

    AuthModule --> AuthAPI
    DashboardModule --> DashboardAPI
    ProjectsModule --> ProjectsAPI
    TicketsModule --> TicketsAPI
    TicketsModule --> CommentsAPI
    ProjectsModule --> LabelsAPI

    SharedTypes -.->|Type Safety| AuthModule
    SharedTypes -.->|Type Safety| ProjectsModule
    SharedTypes -.->|Type Safety| TicketsModule
    SharedTypes -.->|Type Safety| AuthAPI
    SharedTypes -.->|Type Safety| ProjectsAPI
    SharedTypes -.->|Type Safety| TicketsAPI

    AuthAPI --> JWTGuard
    AuthAPI --> AuthService
    UsersAPI --> UsersService
    ProjectsAPI --> ProjectsService
    TicketsAPI --> TicketsService
    CommentsAPI --> CommentsService

    JWTGuard --> RateLimiter
    RateLimiter --> CORS
    CORS --> ValidationPipe

    AuthService --> PolicyService
    ProjectsService --> PolicyService
    TicketsService --> PolicyService

    AuthService --> Prisma
    UsersService --> Prisma
    ProjectsService --> Prisma
    TicketsService --> Prisma
    CommentsService --> Prisma

    Prisma --> PostgreSQL

    style Browser fill:#e1f5ff
    style Angular fill:#dd0031
    style PostgreSQL fill:#336791
    style Prisma fill:#2D3748
    style SharedTypes fill:#3178c6
```

## 🗂️ Datenbank Schema

> **📊 Vollständiges ER-Diagramm:** Siehe [database-erd.md](database-erd.md) (automatisch generiert mit Prisma ERD Generator)

## 🔐 Authentifizierung & Autorisierung Flow

```mermaid
sequenceDiagram
    participant Client as Angular Client
    participant Auth as Auth Controller
    participant Guard as JWT Guard
    participant Policy as Policy Service
    participant DB as PostgreSQL

    Note over Client,DB: Login Flow
    Client->>Auth: POST /auth/login {email, password}
    Auth->>DB: Find User by Email
    DB-->>Auth: User Data
    Auth->>Auth: Verify Password (bcrypt)
    Auth->>Auth: Generate Access Token (15m)
    Auth->>Auth: Generate Refresh Token (7d)
    Auth-->>Client: {accessToken, refreshToken, user}

    Note over Client,DB: Protected Resource Access
    Client->>Guard: GET /api/resource + Bearer Token
    Guard->>Guard: Validate JWT Token
    Guard->>Policy: Check Permissions (RBAC)
    Policy->>DB: Load User Role & Project Memberships
    DB-->>Policy: User Permissions
    Policy-->>Guard: Authorization Result
    Guard-->>Client: Resource Data or 403 Forbidden

    Note over Client,DB: Token Refresh
    Client->>Auth: POST /auth/refresh {refreshToken}
    Auth->>DB: Validate Refresh Token
    DB-->>Auth: Token Valid
    Auth->>Auth: Generate New Access Token
    Auth-->>Client: {accessToken}
```

## 📊 Backend Module Struktur

```mermaid
graph LR
    subgraph "NestJS Backend"
        AppModule[App Module]

        subgraph "Feature Modules"
            AuthMod[Auth Module]
            UsersMod[Users Module]
            ProjectsMod[Projects Module]
            TicketsMod[Tickets Module]
            CommentsMod[Comments Module]
            LabelsMod[Labels Module]
            DashboardMod[Dashboard Module]
            TicketActivitiesMod[Ticket Activities Module]
        end

        subgraph "Core Module"
            DatabaseMod[Database Module]
            HealthMod[Health Module]
            ConfigMod[Config Module]
        end

        subgraph "Guards & Middleware"
            JWTGuard[JWT Auth Guard]
            RoleGuard[Role Guard]
            ThrottlerGuard[Throttler Guard]
        end
    end

    AppModule --> AuthMod
    AppModule --> UsersMod
    AppModule --> ProjectsMod
    AppModule --> TicketsMod
    AppModule --> CommentsMod
    AppModule --> LabelsMod
    AppModule --> DashboardMod
    AppModule --> TicketActivitiesMod
    AppModule --> DatabaseMod
    AppModule --> HealthMod
    AppModule --> ConfigMod

    AuthMod -.-> JWTGuard
    ProjectsMod -.-> JWTGuard
    TicketsMod -.-> JWTGuard

    ProjectsMod -.-> RoleGuard
    TicketsMod -.-> RoleGuard

    AppModule -.-> ThrottlerGuard

    style AppModule fill:#ea2845
    style DatabaseMod fill:#2D3748
    style JWTGuard fill:#4CAF50
```

## 🎨 Frontend Routing & Module Architektur

```mermaid
graph TD
    AppRoot[App Root]

    subgraph "Public Routes"
        Login[Login /login]
        Register[Register /register]
    end

    subgraph "Protected Routes - Authenticated"
        Dashboard[Dashboard /dashboard]

        subgraph "Projects Feature"
            ProjectsList[Projects List /projects]
            ProjectDetail[Project Detail /projects/:id]
            ProjectTabs[Tabs: Overview | Tickets | Members | Settings]
        end

        subgraph "Tickets Feature"
            TicketsList[Tickets List /tickets]
            TicketDetail[Ticket Detail /tickets/:id]
            TicketComponents[Components: Comments | Activity | Labels]
        end

        Profile[User Profile /profile]
        Settings[Settings /settings]
    end

    AppRoot --> Login
    AppRoot --> Register
    AppRoot --> Dashboard
    AppRoot --> ProjectsList
    AppRoot --> TicketsList
    AppRoot --> Profile
    AppRoot --> Settings

    ProjectsList --> ProjectDetail
    ProjectDetail --> ProjectTabs

    TicketsList --> TicketDetail
    TicketDetail --> TicketComponents

    Dashboard -.->|Quick Stats| ProjectsList
    Dashboard -.->|Recent Tickets| TicketsList

    style Login fill:#90CAF9
    style Dashboard fill:#81C784
    style ProjectDetail fill:#FFB74D
    style TicketDetail fill:#E57373
```

## 🚀 Deployment & Infrastructure

```mermaid
graph TB
    subgraph "Development Environment"
        DevFE[ng serve :4200]
        DevBE[nest start --watch :3000]
        DevDB[(PostgreSQL :5432)]
    end

    subgraph "CI/CD Pipeline - GitHub Actions"
        Trigger[Git Push]
        Lint[ESLint Check]
        Build[Nx Build]
        Test[Jest Tests]
        Docker[Docker Build]
    end

    subgraph "Docker Compose Production"
        FrontendContainer[Frontend Container<br/>nginx:alpine]
        BackendContainer[Backend Container<br/>node:alpine]
        DatabaseContainer[(PostgreSQL Container)]

        FrontendContainer -->|Port 80| Nginx[Nginx Reverse Proxy]
        BackendContainer -->|Port 3000| API[NestJS API]
        API --> DatabaseContainer
    end

    Trigger --> Lint
    Lint --> Build
    Build --> Test
    Test --> Docker
    Docker --> FrontendContainer
    Docker --> BackendContainer

    DevFE -.->|Hot Reload| Angular
    DevBE -.->|Hot Reload| NestJS

    style Trigger fill:#2088FF
    style Docker fill:#2496ED
    style Nginx fill:#009639
```

## 🔄 Data Flow - Ticket Creation

```mermaid
sequenceDiagram
    participant UI as Angular UI
    participant Store as State Management
    participant HTTP as HTTP Client
    participant API as Tickets API
    participant Service as Tickets Service
    participant Policy as Policy Service
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL

    UI->>Store: Dispatch Create Ticket Action
    Store->>HTTP: POST /api/tickets
    HTTP->>API: Create Ticket DTO
    API->>API: Validate DTO (class-validator)
    API->>Policy: Check Create Permission
    Policy->>Policy: Verify User is Project Member
    Policy-->>API: Permission Granted
    API->>Service: createTicket(data)
    Service->>Prisma: ticket.create({...})
    Prisma->>DB: INSERT INTO tickets
    DB-->>Prisma: New Ticket Record
    Prisma-->>Service: Ticket Entity
    Service->>Service: Log Ticket Activity
    Service-->>API: Created Ticket
    API-->>HTTP: 201 Created + Ticket Data
    HTTP-->>Store: Update Store State
    Store-->>UI: Render New Ticket
    UI->>UI: Show Success Notification
```

## 📦 Nx Monorepo Dependency Graph

```mermaid
graph LR
    subgraph "Applications"
        Frontend[apps/frontend<br/>Angular App]
        Backend[apps/backend<br/>NestJS API]
    end

    subgraph "Libraries"
        SharedTypes[libs/shared-types<br/>Type Definitions]
    end

    subgraph "Build Outputs"
        FrontendDist[dist/apps/frontend]
        BackendDist[dist/apps/backend]
        LibDist[dist/libs/shared-types]
    end

    Frontend --> SharedTypes
    Backend --> SharedTypes

    Frontend -.->|nx build frontend| FrontendDist
    Backend -.->|nx build backend| BackendDist
    SharedTypes -.->|nx build shared-types| LibDist

    FrontendDist -.->|depends on| LibDist
    BackendDist -.->|depends on| LibDist

    style SharedTypes fill:#3178c6
    style Frontend fill:#dd0031
    style Backend fill:#ea2845
```

## 🛡️ Security Layers

```mermaid
graph TB
    Request[Incoming Request]

    subgraph "Security Pipeline"
        Helmet[Helmet Headers]
        CORS[CORS Policy]
        Throttler[Rate Limiter<br/>100 req/min]
        Validation[Input Validation<br/>class-validator]
        JWT[JWT Verification]
        RBAC[Role-Based Access Control]
        Policy[Policy-Based Authorization]
    end

    Database[(Database<br/>Parameterized Queries)]

    Request --> Helmet
    Helmet --> CORS
    CORS --> Throttler
    Throttler --> Validation
    Validation --> JWT
    JWT --> RBAC
    RBAC --> Policy
    Policy --> Database

    style Helmet fill:#4CAF50
    style JWT fill:#FFC107
    style RBAC fill:#FF9800
    style Policy fill:#F44336
    style Database fill:#336791
```

---

## 📝 Legende

| Symbol     | Bedeutung                        |
| ---------- | -------------------------------- |
| `[ ]`      | Komponente/Modul                 |
| `( )`      | Datenbank                        |
| `-->`      | Datenfluss/Abhängigkeit          |
| `-.->`     | Optionale/Type-Only Abhängigkeit |
| **Farben** | Technology-spezifisch            |
| 🔴 Red     | Angular/NestJS                   |
| 🔵 Blue    | TypeScript/Prisma                |
| 🟢 Green   | Security/Auth                    |
| 🟡 Yellow  | Database                         |

---

**Erstellt am:** 28. Dezember 2025  
**Version:** 1.0.0  
**Projekt:** Issue Tracker Nx Monorepo
