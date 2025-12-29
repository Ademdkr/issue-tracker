# @issue-tracker/shared-types

Shared TypeScript type definitions and contracts for the Issue Tracker monorepo.

## 🎯 Purpose

This library provides **type-safe interfaces** between Backend (NestJS) and Frontend (Angular) and guarantees:

- ✅ **Single Source of Truth** for all API contracts
- ✅ **Compile-Time Type Safety** across project boundaries
- ✅ **No Type Duplication** between Frontend and Backend
- ✅ **Refactoring Safety** - Changes are immediately visible in both apps
- ✅ **Automatic IntelliSense** in both projects

## 📁 Structure

```
libs/shared-types/src/lib/
├── enums/              # Shared Enumerations
│   ├── user.enums.ts   # UserRole
│   ├── ticket.enums.ts # TicketStatus, TicketPriority
│   └── project.enums.ts# ProjectMemberRole (deprecated)
├── models/             # Domain Models (Entities)
│   ├── user.model.ts
│   ├── project.model.ts
│   ├── ticket.model.ts
│   ├── label.model.ts
│   ├── comment.model.ts
│   └── dashboard.model.ts
├── dtos/               # Data Transfer Objects (API Payloads)
│   ├── user.dto.ts
│   ├── project.dto.ts
│   ├── ticket.dto.ts
│   ├── label.dto.ts
│   └── comment.dto.ts
├── api/                # API Response Types & Filters
│   ├── responses.ts    # LoginResponse, etc.
│   └── filters.ts      # FilterOptions, PaginationOptions
├── constants/          # Shared Constants
│   └── pagination.ts   # DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
└── utils/              # Type Utilities & Helpers
    └── type-guards.ts  # isUser(), isTicket(), etc.
```

## 🔑 Core Types

### Enums

```typescript
// User Roles (RBAC)
export enum UserRole {
  REPORTER = 'REPORTER', // Can create tickets
  DEVELOPER = 'DEVELOPER', // Can edit tickets
  MANAGER = 'MANAGER', // Can manage projects
  ADMIN = 'ADMIN', // All rights
}

// Ticket Status
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Ticket Priority
export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
```

### Domain Models

```typescript
// User Entity
export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  createdAt: Date;
}

// Ticket Entity
export interface Ticket {
  id: string;
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  labelIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Project Entity
export interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  createdAt: Date;
}
```

### DTOs (Data Transfer Objects)

```typescript
// Create Ticket Payload
export interface CreateTicketDto {
  title: string;
  description: string;
  priority?: TicketPriority;
  assigneeId?: string;
  labelIds?: string[];
}

// Update Ticket Payload
export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  labelIds?: string[];
}

// Login Credentials
export interface LoginDto {
  email: string;
  password: string;
}
```

### API Response Types

```typescript
// Authentication Response
export interface LoginResponse {
  access_token: string;
  user: User;
}

// Ticket with Relations
export interface TicketWithDetails {
  ticket: Ticket;
  reporter: User;
  assignee?: User;
  labels: Label[];
  commentCount: number;
}
```

## 🔄 Usage

### In Backend (NestJS)

```typescript
// Controller
import { CreateTicketDto, Ticket } from '@issue-tracker/shared-types';

@Controller('tickets')
export class TicketsController {
  @Post()
  create(@Body() dto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(dto);
  }
}

// Service
import { TicketStatus, TicketPriority } from '@issue-tracker/shared-types';

@Injectable()
export class TicketsService {
  async create(dto: CreateTicketDto): Promise<Ticket> {
    // TypeScript knows all properties of CreateTicketDto
    return this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: TicketStatus.OPEN,
        priority: dto.priority || TicketPriority.MEDIUM,
      },
    });
  }
}
```

### In Frontend (Angular)

```typescript
// Service
import { CreateTicketDto, Ticket } from '@issue-tracker/shared-types';

@Injectable()
export class TicketsService {
  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    // TypeScript automatically validates that dto has all required fields
    return this.http.post<Ticket>('/api/tickets', dto);
  }
}

// Component
import { TicketStatus, TicketPriority } from '@issue-tracker/shared-types';

export class TicketFormComponent {
  statusOptions = Object.values(TicketStatus);
  priorityOptions = Object.values(TicketPriority);

  onSubmit(form: FormGroup) {
    const dto: CreateTicketDto = {
      title: form.value.title,
      description: form.value.description,
      priority: form.value.priority,
    };
    // Compile-time check: all required properties must be set
  }
}
```

## ✨ Benefits

### 1. Type Safety Across API Boundaries

```typescript
// ❌ BEFORE: Duplication & Error-Prone
// Backend
interface CreateTicketDto {
  title: string;
  description: string;
}

// Frontend (defined separately!)
interface CreateTicketRequest {
  title: string;
  description: string;
}

// Problem: Changes in Backend → Frontend breaks ONLY at runtime!
```

```typescript
// ✅ AFTER: Shared Type
// Backend & Frontend use the SAME definition
import { CreateTicketDto } from '@issue-tracker/shared-types';

// Changes → Compile errors in both projects immediately visible!
```

### 2. Refactoring Safety

```typescript
// Enum change in shared-types
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED', // NEW: renamed from RESOLVED
  CLOSED = 'CLOSED',
}

// TypeScript shows errors IMMEDIATELY in:
// - Backend Controllers
// - Backend Services
// - Frontend Components
// - Frontend Services
// → No forgotten code!
```

### 3. IntelliSense & Autocomplete

- IDE automatically suggests all properties
- Typo errors are prevented
- API contracts are self-documenting

## 🏗️ Build & Development

```bash
# Build library
npx nx build shared-types

# Run tests
npx nx test shared-types

# Type-Check
npx nx run shared-types:type-check
```

### Dependency Graph

```mermaid
graph LR
    Backend[Backend NestJS] --> SharedTypes[shared-types]
    Frontend[Frontend Angular] --> SharedTypes

    SharedTypes --> Enums[enums/]
    SharedTypes --> Models[models/]
    SharedTypes --> DTOs[dtos/]
    SharedTypes --> API[api/]
```

## 📝 Conventions

### Naming

- **Models**: `*.model.ts` - Domain Entities (e.g. `User`, `Ticket`)
- **DTOs**: `*.dto.ts` - API Payloads (e.g. `CreateTicketDto`, `UpdateUserDto`)
- **Enums**: `*.enums.ts` - Enumerations (e.g. `UserRole`, `TicketStatus`)
- **Responses**: `responses.ts` - API Response Types (e.g. `LoginResponse`)

### Best Practices

1. **No Business Logic** - Only Type Definitions & Interfaces
2. **Immutability** - Prefer `readonly` for properties
3. **Optional Properties** - Use `?` for optional fields
4. **Type Aliases** - Use `type` for Union Types, `interface` for Objects
5. **Barrel Exports** - Use `index.ts` for clean imports

## 🔗 External Dependencies

This library has **NO** runtime dependencies - only TypeScript types.

## 📚 Additional Documentation

- [Shared Types Consistency Guide](../../docs/guides/shared-types/shared-types-consistency.md)
- [Backend Architecture](../../docs/guides/backend/architecture.md)
- [API Documentation](http://localhost:3000/api/docs)

## 🤝 Contributing

When making changes to Shared Types:

1. **Check Impact**: `npx nx affected:graph`
2. **Update Both Apps**: Adjust Backend + Frontend
3. **Update Tests**: Unit tests in both projects
4. **Documentation**: Update README for breaking changes

---

**Built with ❤️ for type-safe full-stack development**
