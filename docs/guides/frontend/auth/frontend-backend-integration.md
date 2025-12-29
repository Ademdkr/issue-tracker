# Frontend-Backend Integration mit Shared Types

**Datum:** 17. November 2025  
**Branch:** `feature/jwt-integration-and-backend-finished`

## Übersicht

Dieses Dokument beschreibt die Integration zwischen Frontend (Angular) und Backend (NestJS) für den Login-Flow. Die Integration nutzt die gemeinsame `shared-types` Library für Type-Safety über die gesamte Anwendung hinweg.

---

## 🎯 Ziele

1. ✅ Gemeinsame TypeScript-Types zwischen Frontend und Backend nutzen
2. ✅ Duplizierung von Type-Definitionen vermeiden
3. ✅ Type-Safety über die gesamte Anwendung garantieren
4. ✅ Funktionierende Login-Integration zwischen Frontend und Backend
5. ✅ Konfigurierbare API-URL für verschiedene Environments

---

## 📁 Shared Types Library

Die `shared-types` Library befindet sich in `libs/shared-types` und exportiert alle gemeinsamen Types:

### Struktur

```
libs/shared-types/
├── src/
│   ├── index.ts                    # Barrel Export
│   └── lib/
│       ├── models/
│       │   ├── user.model.ts       # User, UserPublic Interfaces
│       │   ├── project.model.ts
│       │   ├── ticket.model.ts
│       │   └── ...
│       ├── enums/
│       │   ├── user.enums.ts       # UserRole, UserStatus
│       │   ├── ticket.enums.ts
│       │   └── ...
│       ├── dtos/
│       │   ├── user.dto.ts         # LoginDto, CreateUserDto, ...
│       │   ├── project.dto.ts
│       │   └── ...
│       └── constants/
│           └── validation.constants.ts
```

### Wichtige Types für Login-Integration

#### User Model (`user.model.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
```

#### User Role Enum (`user.enums.ts`)

```typescript
export enum UserRole {
  REPORTER = 'REPORTER',
  DEVELOPER = 'DEVELOPER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}
```

#### Login DTO (`user.dto.ts`)

```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
```

#### Login Response DTO (`user.dto.ts`)

```typescript
export class LoginResponseDto {
  user!: {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: UserRole;
  };
  accessToken!: string;
  refreshToken?: string;
}
```

### Import in Apps

```typescript
// Einfacher Import aus shared-types
import { User, UserRole, LoginDto } from '@issue-tracker/shared-types';
```

---

## 🔧 Backend-Integration

### 1. Auth Controller (`apps/backend/src/app/auth/auth.controller.ts`)

**Änderungen:**

- ❌ **Entfernt:** Lokale `LoginDto` Klasse
- ✅ **Hinzugefügt:** Import aus `@issue-tracker/shared-types`

```typescript
import { LoginDto } from '@issue-tracker/shared-types';

@Controller('auth')
export class AuthController {
  @Public() // Öffentlich zugänglich ohne Authentication
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```

### 2. CurrentUserGuard Update

Der `CurrentUserGuard` wurde aktualisiert, um den `@Public()` Decorator zu respektieren:

**Datei:** `apps/backend/src/app/auth/guards/current-user.guard.ts`

```typescript
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector // Neu!
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Prüfe ob Route als @Public() markiert ist
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Keine Authentication erforderlich
    }

    // Normale Authentication-Logik...
  }
}
```

### 3. Login Response Struktur

**Backend Response (`auth.service.ts`):**

```typescript
return {
  access_token: accessToken, // JWT Token
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    role: user.role,
    createdAt: user.createdAt,
  },
};
```

---

## 🎨 Frontend-Integration

### 1. Environment Configuration

Neue Environment Files für flexible API-URL-Konfiguration:

#### Development (`apps/frontend/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

#### Production (`apps/frontend/src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api', // Relative URL für Production
};
```

### 2. Auth Service (`apps/frontend/src/app/core/services/auth.service.ts`)

**Änderungen:**

- ❌ **Entfernt:** Lokale `User`, `LoginRequest` Interfaces
- ✅ **Hinzugefügt:** Import aus `@issue-tracker/shared-types`
- ✅ **Hinzugefügt:** Environment-basierte API-URL

```typescript
import { User, UserRole, LoginDto } from '@issue-tracker/shared-types';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  access_token: string; // Backend gibt access_token zurück
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = environment.apiUrl; // Konfigurierbar!

  login(credentials: LoginDto): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.access_token);
          this.setUser(response.user);
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        })
      );
  }
}
```

### 3. Login Component (`apps/frontend/src/app/features/auth/login/login.component.ts`)

Nutzt `LoginDto` aus shared-types für Type-Safety:

```typescript
import { LoginDto } from '@issue-tracker/shared-types';

export class LoginComponent {
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const credentials: LoginDto = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          this.handleLoginError(error);
        },
      });
    }
  }
}
```

---

## 🔐 TypeScript Strict Mode

### Problem: DTO Property Initializer

Angular verwendet strikte TypeScript-Kompilierungsoptionen. DTOs benötigten Definite Assignment Assertions:

**Fehler:**

```
TS2564: Property 'email' has no initializer and is not definitely assigned in the constructor.
```

**Lösung:**
Alle erforderlichen DTO-Properties mit `!` Operator markiert:

```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string; // Definite Assignment Assertion

  @IsString()
  @IsNotEmpty()
  password!: string;
}
```

**Betroffene DTOs:**

- ✅ `user.dto.ts` - LoginDto, CreateUserDto, ChangePasswordDto, LoginResponseDto
- ✅ `comment.dto.ts` - CreateCommentDto, UpdateCommentDto
- ✅ `label.dto.ts` - CreateLabelDto
- ✅ `project.dto.ts` - CreateProjectDto, AddProjectMemberDto, RemoveProjectMemberDto
- ✅ `ticket.dto.ts` - CreateTicketDto, CreateTicketActivityDto

---

## 🧪 Integration Testing

### Test-Credentials aus Seed-Script

```typescript
Email:    admin@example.com
Passwort: Admin123!
Rolle:    ADMIN
```

### Backend-Test (PowerShell)

```powershell
$body = @{ email = 'admin@example.com'; password = 'Admin123!' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json' | ConvertTo-Json -Depth 5
```

**Erfolgreiche Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "0ecc9001-254b-4058-8455-f0fc61e531da",
    "email": "admin@example.com",
    "name": "Test",
    "surname": "Admin",
    "role": "ADMIN",
    "createdAt": "2025-11-12T04:52:45.045Z"
  }
}
```

### Frontend-Test (Browser)

1. **Backend starten:**

   ```bash
   npx nx serve backend
   ```

   → Backend läuft auf `http://localhost:3000/api`

2. **Frontend starten:**

   ```bash
   npx nx serve frontend
   ```

   → Frontend läuft auf `http://localhost:4200`

3. **Login durchführen:**

   - Browser öffnen: `http://localhost:4200`
   - Login-Formular ausfüllen:
     - Email: `admin@example.com`
     - Passwort: `Admin123!`
   - "Anmelden" Button klicken

4. **Erfolgreicher Login:**
   - ✅ JWT Token in LocalStorage gespeichert (`jwt_token`)
   - ✅ User-Daten in LocalStorage gespeichert (`current_user`)
   - ✅ Redirect zu `/projects`
   - ✅ Authorization-Header in nachfolgenden Requests: `Bearer <token>`

---

## 🔄 Workflow-Diagramm

```
┌─────────────┐                              ┌─────────────┐
│   Frontend  │                              │   Backend   │
│   (Angular) │                              │   (NestJS)  │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. POST /api/auth/login                   │
       │     Body: { email, password }              │
       ├───────────────────────────────────────────>│
       │                                            │
       │                              2. Validate   │
       │                                 Credentials│
       │                              3. Generate   │
       │                                 JWT Token  │
       │                                            │
       │  4. Response:                              │
       │     { access_token, user }                 │
       │<───────────────────────────────────────────┤
       │                                            │
       │  5. Store Token in LocalStorage            │
       │  6. Set Authorization Header               │
       │                                            │
       │  7. GET /api/projects                      │
       │     Header: Authorization: Bearer <token>  │
       ├───────────────────────────────────────────>│
       │                                            │
       │                              8. Verify JWT │
       │                              9. Load User  │
       │                                            │
       │  10. Response: [projects]                  │
       │<───────────────────────────────────────────┤
       │                                            │
```

---

## 📦 Deployment-Überlegungen

### Development

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000/api`
- API-URL: `environment.apiUrl = 'http://localhost:3000/api'`

### Production

- Frontend: `https://issue-tracker.example.com`
- Backend: `https://issue-tracker.example.com/api`
- API-URL: `environment.apiUrl = '/api'` (relative URL)

### Build-Kommandos

```bash
# Frontend Production Build
npx nx build frontend --configuration=production

# Backend Production Build
npx nx build backend --configuration=production
```

---

## ✅ Vorteile der Integration

### 1. Type-Safety

- ✅ Gleiche Types in Frontend und Backend
- ✅ Compiler-Fehler bei Type-Mismatch
- ✅ IntelliSense/Auto-Completion in beiden Apps

### 2. Single Source of Truth

- ✅ Eine zentrale Type-Definition
- ✅ Änderungen propagieren automatisch
- ✅ Keine Duplikation von Code

### 3. Entwickler-Erfahrung

- ✅ Einfacher Import: `@issue-tracker/shared-types`
- ✅ Konsistente Naming Conventions
- ✅ Validation-Decorators in DTOs

### 4. Wartbarkeit

- ✅ Zentrale Änderungen in `shared-types`
- ✅ Nx Cache für schnelle Builds
- ✅ Dependency Graph zeigt Abhängigkeiten

---

## 🐛 Häufige Probleme & Lösungen

### Problem 1: CORS-Fehler

**Symptom:**

```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login'
from origin 'http://localhost:4200' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Lösung:**
CORS muss im Backend aktiviert werden (`apps/backend/src/main.ts`):

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS aktivieren für Frontend-Zugriff
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
```

**Wichtig:** Nach dem Hinzufügen von CORS wird das Backend automatisch neu geladen (Hot Reload).

### Problem 2: @Public() Decorator wird ignoriert

**Symptom:**

```
401 Unauthorized: Authentication required. Please provide x-user-id header.
```

**Lösung:**
CurrentUserGuard benötigt `Reflector` für Metadata-Zugriff:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly reflector: Reflector  // Wichtig!
) {}
```

### Problem 3: TypeScript Strict Mode Errors

**Symptom:**

```
TS2564: Property has no initializer and is not definitely assigned
```

**Lösung:**
Definite Assignment Assertion `!` verwenden:

```typescript
email!: string;  // Statt: email: string;
```

### Problem 4: Environment-Datei nicht gefunden

**Symptom:**

```
Cannot find module '../../../environments/environment'
```

**Lösung:**
Environment-Dateien erstellen:

- `apps/frontend/src/environments/environment.ts`
- `apps/frontend/src/environments/environment.prod.ts`

---

## 📚 Nächste Schritte

1. **JWT Guard aktivieren:**

   - CurrentUserGuard durch JwtAuthGuard ersetzen
   - JWT-basierte Authentifizierung für alle geschützten Routen

2. **Refresh Token implementieren:**

   - Refresh Token in LoginResponse hinzufügen
   - Token-Rotation für erhöhte Sicherheit

3. **Error Handling verbessern:**

   - Globaler Error Interceptor im Frontend
   - Spezifische Error-Messages für User

4. **Testing:**
   - E2E-Tests für Login-Flow
   - Unit-Tests für AuthService
   - Integration-Tests Backend ↔ Frontend

---

## 📖 Referenzen

- [Nx Monorepo Documentation](https://nx.dev)
- [Angular HTTP Client](https://angular.io/guide/http)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io)
- [Class Validator](https://github.com/typestack/class-validator)

---

**Status:** ✅ **Integration vollständig und funktionsfähig**

- Backend: Login-Endpoint öffentlich zugänglich
- Frontend: Auth Service nutzt shared-types
- Environment: API-URL konfigurierbar
- Testing: Login erfolgreich mit admin@example.com
