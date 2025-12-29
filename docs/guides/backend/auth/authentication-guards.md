# Authentication & Authorization Guards

Detaillierte Dokumentation der Guards im Issue Tracker Backend.

---

## Übersicht: Guard Execution Order

```
HTTP Request
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. CurrentUserGuard (Global - APP_GUARD)                       │
│    → Lädt User aus x-user-id Header                            │
│    → Setzt request.user                                         │
│    → Wirft UnauthorizedException wenn User fehlt               │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. RoleGuard (Optional - via @UseGuards)                       │
│    → Prüft User-Rolle gegen @Roles() Decorator                 │
│    → Wirft ForbiddenException wenn Rolle nicht passt           │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ProjectAccessGuard (Optional - via @UseGuards)              │
│    → Prüft Projekt-Mitgliedschaft                              │
│    → Wirft ForbiddenException wenn kein Zugriff                │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. PoliciesGuard (Optional - via @UseGuards + @CheckPolicies)  │
│    → Führt Policy-Handler aus                                   │
│    → Wirft ForbiddenException wenn Policy fehlschlägt          │
└─────────────────────────────────────────────────────────────────┘
    ↓
Controller Method
```

---

## 1. CurrentUserGuard

### Zweck

Lädt den User aus der Datenbank basierend auf dem `x-user-id` Header und macht ihn als `request.user` verfügbar.

### Registrierung

```typescript
// apps/backend/src/app/core/app.module.ts
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: CurrentUserGuard,  // ← Global registriert
    },
  ],
})
```

**Wichtig:** Muss als **globaler Guard** (`APP_GUARD`) registriert sein, damit er vor allen anderen Guards läuft.

### Verwendung

**Request-Header:**

```http
GET /api/projects/123
x-user-id: 550e8400-e29b-41d4-a716-446655440000
```

**Im Controller:**

```typescript
@Get(':id')
async getProject(@Param('id') id: string, @Request() req) {
  console.log(req.user);  // ← User wurde von CurrentUserGuard gesetzt
  // {
  //   id: '550e8400-e29b-41d4-a716-446655440000',
  //   email: 'john@example.com',
  //   role: 'DEVELOPER',
  //   ...
  // }
}
```

### Exception-Handling

| Situation        | Exception               | HTTP Status | Nachricht                                                            |
| ---------------- | ----------------------- | ----------- | -------------------------------------------------------------------- |
| Header fehlt     | `UnauthorizedException` | 401         | "Authentication required. Please provide x-user-id header."          |
| Header ist Array | `UnauthorizedException` | 401         | "Invalid x-user-id header format. Expected single value, got array." |
| Header ist leer  | `UnauthorizedException` | 401         | "x-user-id header cannot be empty."                                  |
| User nicht in DB | `UnauthorizedException` | 401         | "User with ID '...' not found. Please check your credentials."       |

### Implementierungsdetails

#### Type-Safety mit extractUserId()

```typescript
private extractUserId(headerValue: string | string[] | undefined): string {
  // Fall 1: Header fehlt komplett
  if (!headerValue) {
    throw new UnauthorizedException('...');
  }

  // Fall 2: Header ist Array (mehrfach gesendet)
  // Beispiel: x-user-id: uuid1, x-user-id: uuid2
  // Express kombiniert → ['uuid1', 'uuid2']
  if (Array.isArray(headerValue)) {
    throw new UnauthorizedException('...');
  }

  // Fall 3: Header ist leer String
  if (headerValue.trim() === '') {
    throw new UnauthorizedException('...');
  }

  // Fall 4: Erfolg - gültiger String
  return headerValue.trim();  // Entfernt Whitespace
}
```

**Warum diese Methode?**

- **Type-Safety:** Express-Header können `string | string[] | undefined` sein
- **Validierung:** Alle Edge-Cases werden abgefangen
- **Defensive Programmierung:** `.trim()` entfernt versehentliche Whitespaces

#### Warum UnauthorizedException statt BadRequestException?

| Exception               | HTTP Status | Bedeutung                        | Verwendung                        |
| ----------------------- | ----------- | -------------------------------- | --------------------------------- |
| `UnauthorizedException` | 401         | "Du bist nicht authentifiziert"  | ✅ Fehlende/ungültige Credentials |
| `BadRequestException`   | 400         | "Dein Request-Format ist falsch" | ❌ NICHT für Auth-Fehler          |

**Beispiel:**

```typescript
// ❌ FALSCH (vorher)
throw new BadRequestException('x-user-id header is required');
// → Impliziert: Format-Fehler im Request-Body

// ✅ RICHTIG (jetzt)
throw new UnauthorizedException('Authentication required...');
// → Klar: Authentifizierungsfehler
```

### Migration zu JWT (Zukünftig)

Dieser Guard ist **temporär** und wird später durch JWT Authentication ersetzt:

```typescript
// Zukünftig:
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Nutzt passport-jwt Strategy
  // Validiert JWT Token statt x-user-id Header
}
```

**Migration-Schritte:**

1. `passport-jwt` installieren
2. JWT Strategy konfigurieren
3. `CurrentUserGuard` durch `JwtAuthGuard` ersetzen
4. Frontend auf JWT-Tokens umstellen

---

## 2. ProjectAccessGuard

### Zweck

Prüft, ob der authentifizierte User Zugriff auf ein spezifisches Projekt hat.

### Zugriffsberechtigung

| Rolle         | Zugriff              | Erklärung                                        |
| ------------- | -------------------- | ------------------------------------------------ |
| **ADMIN**     | Alle Projekte        | Uneingeschränkter Zugriff (System-Administrator) |
| **MANAGER**   | Alle Projekte        | Uneingeschränkter Zugriff (Projekt-Manager)      |
| **DEVELOPER** | Nur Mitgliedschaften | Nur Projekte, bei denen User Mitglied ist        |
| **REPORTER**  | Nur Mitgliedschaften | Nur Projekte, bei denen User Mitglied ist        |

### Verwendung

```typescript
@Controller('projects')
export class ProjectsController {
  // Beispiel 1: Einzelnes Projekt abrufen
  @Get(':id')
  @UseGuards(ProjectAccessGuard) // ← Guard aktivieren
  async getProject(@Param('id') id: string) {
    // Wenn Code hier ankommt, hat User Zugriff auf Projekt
    return this.projectsService.findOne(id);
  }

  // Beispiel 2: Nested Route (projectId statt id)
  @Get(':projectId/tickets')
  @UseGuards(ProjectAccessGuard) // ← Funktioniert auch hier
  async getTickets(@Param('projectId') projectId: string) {
    // Guard extrahiert automatisch :projectId
    return this.ticketsService.findByProject(projectId);
  }

  // Beispiel 3: Kombiniert mit RoleGuard
  @Delete(':id')
  @UseGuards(RoleGuard, ProjectAccessGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async deleteProject(@Param('id') id: string) {
    // 1. RoleGuard: User muss Manager oder Admin sein
    // 2. ProjectAccessGuard: User muss Zugriff auf Projekt haben
    return this.projectsService.delete(id);
  }
}
```

### Voraussetzungen

1. **CurrentUserGuard muss gelaufen sein**

   - `request.user` muss gesetzt sein
   - Da CurrentUserGuard global ist (APP_GUARD), ist das garantiert

2. **Route muss Projekt-Parameter haben**
   - `:id` ODER `:projectId`
   - Beispiele:
     - ✅ `/projects/:id`
     - ✅ `/projects/:projectId/tickets`
     - ❌ `/projects` (kein Parameter)

### Exception-Handling

| Situation               | Exception            | HTTP Status | Nachricht                                                                                                       |
| ----------------------- | -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| Projekt-Parameter fehlt | `ForbiddenException` | 403         | "Project ID is required in route parameters. Expected route pattern: /projects/:id or /projects/:projectId/..." |
| User ist kein Mitglied  | `ForbiddenException` | 403         | "Access denied. You are not a member of project '...'."                                                         |

### Implementierungsdetails

#### Warum kein User-Check mehr?

**Vorher (redundant):**

```typescript
const user = request.user;

if (!user) {
  throw new ForbiddenException('User not authenticated');
}
```

**Problem:** Dieser Code ist **dead code**, weil:

1. `CurrentUserGuard` ist global registriert (APP_GUARD)
2. Läuft **IMMER** vor `ProjectAccessGuard`
3. Wirft bereits `UnauthorizedException` wenn User fehlt
4. Wenn Code in `ProjectAccessGuard` ankommt, ist `user` **garantiert** gesetzt

**Jetzt (optimiert):**

```typescript
const user = request.user as User;
// Type-Assertion ausreichend, da User garantiert vorhanden
```

#### extractProjectId() - Flexibles Parameter-Handling

```typescript
private extractProjectId(params: Record<string, unknown>): string {
  // Unterstützt beide Naming-Conventions
  const projectId = (params.id || params.projectId) as string | undefined;

  if (!projectId) {
    throw new ForbiddenException(
      'Project ID is required in route parameters. ' +
      'Expected route pattern: /projects/:id or /projects/:projectId/...'
    );
  }

  return projectId;
}
```

**Unterstützte Route-Patterns:**

| Route                          | Parameter          | Funktioniert? |
| ------------------------------ | ------------------ | ------------- |
| `/projects/:id`                | `params.id`        | ✅            |
| `/projects/:projectId/tickets` | `params.projectId` | ✅            |
| `/projects/:id/labels`         | `params.id`        | ✅            |
| `/projects`                    | (kein Parameter)   | ❌ Exception  |

#### Zugriffsprüfung via ProjectsService

```typescript
const hasAccess = await this.projectsService.hasProjectAccess(projectId, user.id);
```

**Was macht `hasProjectAccess()`?**

```typescript
// In ProjectsService
async hasProjectAccess(projectId: string, userId: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Admins und Manager haben immer Zugriff
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return true;
  }

  // Für andere: Prüfe Mitgliedschaft
  const project = await this.prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { id: userId },
      },
    },
  });

  return project !== null;
}
```

**Warum im Service und nicht im Guard?**

- **Separation of Concerns:** Business-Logik gehört in Services
- **Wiederverwendbarkeit:** Gleiche Logik kann in anderen Services verwendet werden
- **Testbarkeit:** Service kann einfacher gemockt werden

---

## 3. Best Practices

### Guard Kombination

```typescript
// Reihenfolge ist wichtig!
@UseGuards(RoleGuard, ProjectAccessGuard, PoliciesGuard)
@Roles(UserRole.MANAGER)
@CheckPolicies(UpdateProjectPolicyHandler)
async updateProject(@Param('id') id: string) {
  // Ausführungsreihenfolge:
  // 1. CurrentUserGuard (global) → User laden
  // 2. RoleGuard → User muss Manager sein
  // 3. ProjectAccessGuard → User muss Projekt-Zugriff haben
  // 4. PoliciesGuard → UpdateProjectPolicy muss erfüllt sein
}
```

### Error Handling im Frontend

```typescript
// Frontend: Axios Interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 401:
        // UnauthorizedException
        // → User ist nicht authentifiziert
        // → Redirect zu Login
        router.push('/login');
        break;

      case 403:
        // ForbiddenException
        // → User ist authentifiziert, aber nicht autorisiert
        // → Zeige Fehler-Nachricht
        toast.error(message || 'Access denied');
        break;

      default:
        toast.error('An error occurred');
    }
  }
);
```

### Testing

#### CurrentUserGuard Unit Test

```typescript
describe('CurrentUserGuard', () => {
  it('should throw UnauthorizedException when header is missing', async () => {
    const context = createMockExecutionContext({
      headers: {}, // ← Kein x-user-id Header
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should set request.user when valid user ID', async () => {
    const mockUser = { id: 'uuid', email: 'test@test.com', role: 'ADMIN' };
    prismaService.user.findUnique.mockResolvedValue(mockUser);

    const context = createMockExecutionContext({
      headers: { 'x-user-id': 'uuid' },
    });

    await guard.canActivate(context);

    expect(context.switchToHttp().getRequest().user).toEqual(mockUser);
  });
});
```

#### ProjectAccessGuard Unit Test

```typescript
describe('ProjectAccessGuard', () => {
  it('should allow access for project member', async () => {
    projectsService.hasProjectAccess.mockResolvedValue(true);

    const context = createMockExecutionContext({
      user: { id: 'user-id', role: 'DEVELOPER' },
      params: { id: 'project-id' },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access for non-member', async () => {
    projectsService.hasProjectAccess.mockResolvedValue(false);

    const context = createMockExecutionContext({
      user: { id: 'user-id', role: 'DEVELOPER' },
      params: { id: 'project-id' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
```

---

## 4. Zusammenfassung

| Guard                  | Zweck           | Exception                     | Registrierung          |
| ---------------------- | --------------- | ----------------------------- | ---------------------- |
| **CurrentUserGuard**   | User laden      | `UnauthorizedException` (401) | Global (APP_GUARD)     |
| **RoleGuard**          | Rollen-Check    | `ForbiddenException` (403)    | Per Route (@UseGuards) |
| **ProjectAccessGuard** | Projekt-Zugriff | `ForbiddenException` (403)    | Per Route (@UseGuards) |
| **PoliciesGuard**      | Policy-Check    | `ForbiddenException` (403)    | Per Route (@UseGuards) |

### HTTP Status Codes

- **401 Unauthorized:** Authentifizierung fehlgeschlagen (z.B. kein/ungültiger Header)
- **403 Forbidden:** Authentifizierung OK, aber keine Berechtigung (z.B. falsche Rolle)

### Execution Order

1. **Global Guards** (APP_GUARD) → `CurrentUserGuard`
2. **Route Guards** (@UseGuards) → `RoleGuard`, `ProjectAccessGuard`, `PoliciesGuard`
3. **Controller Method**

**Wichtig:** Guards laufen in der Reihenfolge, wie sie definiert sind!
