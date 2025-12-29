# JWT Guard Aktivierung und Error Handling

**Datum:** 17. November 2025  
**Branch:** `feature/jwt-integration-and-backend-finished`

## Übersicht

Dieses Dokument beschreibt die Umstellung von `CurrentUserGuard` auf `JwtAuthGuard` im Backend sowie die Implementierung eines globalen Error Interceptors im Frontend für verbesserte Fehlerbehandlung.

---

## 🎯 Ziele

1. ✅ JWT-basierte Authentifizierung für alle geschützten Routen aktivieren
2. ✅ `CurrentUserGuard` (Header-basiert) durch `JwtAuthGuard` (Token-basiert) ersetzen
3. ✅ Globalen Error Interceptor im Frontend implementieren
4. ✅ User-freundliche Fehlermeldungen für alle HTTP-Fehler
5. ✅ Automatisches Logout bei abgelaufenem Token

---

## 🔐 Teil 1: JWT Guard Aktivierung (Backend)

### Problem mit CurrentUserGuard

Der `CurrentUserGuard` basierte auf einem `x-user-id` Header, der manuell gesetzt werden musste:

```typescript
// VORHER: CurrentUserGuard
headers: {
  'x-user-id': '0ecc9001-254b-4058-8455-f0fc61e531da'
}
```

**Nachteile:**

- ❌ Keine echte Authentifizierung
- ❌ User-ID muss manuell bekannt sein
- ❌ Kein Token-Ablauf
- ❌ Keine Verschlüsselung der User-Daten

### Lösung: JwtAuthGuard

Der `JwtAuthGuard` nutzt JWT Tokens aus dem `Authorization` Header:

```typescript
// NACHHER: JwtAuthGuard
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

**Vorteile:**

- ✅ Sichere Token-basierte Authentifizierung
- ✅ Automatischer Token-Ablauf (Expiration)
- ✅ Verschlüsselte User-Daten im Token
- ✅ Industry-Standard (OAuth 2.0)

### Implementation

#### 1. JwtAuthGuard bereits vorhanden

Der `JwtAuthGuard` war bereits implementiert in `apps/backend/src/app/auth/guards/jwt-auth.guard.ts`:

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Prüfe ob Route als @Public() markiert ist
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Kein JWT erforderlich
    }

    // Normale JWT-Validierung durch Passport JWT Strategy
    return super.canActivate(context);
  }
}
```

**Wichtige Features:**

- Erweitert `AuthGuard('jwt')` von Passport
- Respektiert `@Public()` Decorator für öffentliche Routen
- Nutzt `Reflector` für Metadata-Zugriff

#### 2. AppModule aktualisiert

**Datei:** `apps/backend/src/app/core/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth'; // Statt CurrentUserGuard
import { PrismaModule } from '../database';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TicketsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // ← JWT Guard aktiviert!
    },
  ],
})
export class AppModule {}
```

**Änderungen:**

- ❌ **Entfernt:** `CurrentUserGuard` Import
- ✅ **Hinzugefügt:** `JwtAuthGuard` Import
- ✅ **Geändert:** `APP_GUARD` Provider nutzt `JwtAuthGuard`

#### 3. Öffentliche Routen mit @Public()

Der Login-Endpoint bleibt öffentlich zugänglich:

```typescript
@Controller('auth')
export class AuthController {
  @Public() // ← Route ohne JWT-Schutz
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```

### Testing

#### Test 1: Login (öffentlich)

```powershell
$body = @{ email = 'admin@example.com'; password = 'Admin123!' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method Post -Body $body -ContentType 'application/json'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "0ecc9001-254b-4058-8455-f0fc61e531da",
    "email": "admin@example.com",
    "name": "Test",
    "surname": "Admin",
    "role": "ADMIN"
  }
}
```

✅ **Erfolgreich:** Login funktioniert ohne Token

#### Test 2: Geschützte Route ohne Token

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/projects' -Method Get
```

**Response:**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

✅ **Erfolgreich:** Zugriff verweigert ohne Token

#### Test 3: Geschützte Route mit Token

```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Invoke-RestMethod -Uri 'http://localhost:3000/api/projects' `
  -Method Get -Headers @{ Authorization = "Bearer $token" }
```

**Response:**

```json
[
  {
    "id": "6c9bdff1-ab38-4141-8718-eea5a3049d6f",
    "name": "ERP-System",
    "description": "ERP-System für Logistik-Unternehmen",
    "slug": "ERP",
    "status": "OPEN"
  }
]
```

✅ **Erfolgreich:** Zugriff mit gültigem Token

---

## 🚨 Teil 2: Error Handling im Frontend

### Problem ohne Error Interceptor

Ohne zentralen Error Interceptor musste jeder HTTP-Request individuell Error-Handling implementieren:

```typescript
// VORHER: Error Handling in jeder Component
this.authService.login(credentials).subscribe({
  next: (response) => {
    /* ... */
  },
  error: (error) => {
    if (error.status === 401) {
      this.snackBar.open('Ungültige Anmeldedaten', 'Schließen');
    } else if (error.status === 500) {
      this.snackBar.open('Server-Fehler', 'Schließen');
    }
    // ... weitere Error-Cases
  },
});
```

**Nachteile:**

- ❌ Code-Duplikation in jeder Component
- ❌ Inkonsistente Fehlermeldungen
- ❌ Kein automatisches Logout bei 401
- ❌ Schwer zu warten

### Lösung: Globaler Error Interceptor

Ein zentraler HTTP Interceptor behandelt alle Fehler:

```typescript
// NACHHER: Zentrale Error-Behandlung
this.authService.login(credentials).subscribe({
  next: (response) => {
    /* ... */
  },
  error: () => {
    // Error wird vom Interceptor behandelt
    this.isLoading = false;
  },
});
```

**Vorteile:**

- ✅ Single Source of Truth für Error-Handling
- ✅ Konsistente Fehlermeldungen
- ✅ Automatisches Logout bei abgelaufenem Token
- ✅ User-freundliche Messages in MatSnackBar

### Implementation

#### 1. Error Interceptor erstellt

**Datei:** `apps/frontend/src/app/core/interceptors/error.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

      if (error.error instanceof ErrorEvent) {
        // Client-seitiger Fehler
        errorMessage = `Fehler: ${error.error.message}`;
      } else {
        // Server-seitiger Fehler
        switch (error.status) {
          case 401:
            errorMessage =
              'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
            // Token ungültig → Logout
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            router.navigate(['/login']);
            break;

          case 403:
            errorMessage = 'Sie haben keine Berechtigung für diese Aktion.';
            break;

          case 404:
            errorMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
            break;

          case 400:
            // Validierungsfehler vom Backend
            if (error.error?.message) {
              if (Array.isArray(error.error.message)) {
                errorMessage = error.error.message.join(', ');
              } else {
                errorMessage = error.error.message;
              }
            } else {
              errorMessage =
                'Ungültige Eingabe. Bitte überprüfen Sie Ihre Daten.';
            }
            break;

          case 500:
            errorMessage =
              'Server-Fehler. Bitte versuchen Sie es später erneut.';
            break;

          case 0:
            // Network Error (Backend nicht erreichbar)
            errorMessage =
              'Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung.';
            break;

          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `Fehler ${error.status}: ${error.statusText}`;
            }
        }
      }

      // Zeige Fehlermeldung in SnackBar
      snackBar.open(errorMessage, 'Schließen', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });

      // Error weiterreichen für weitere Behandlung
      return throwError(() => error);
    })
  );
};
```

**Features:**

- ✅ **401 Unauthorized:** Automatisches Logout + Redirect zu `/login`
- ✅ **403 Forbidden:** Berechtigungs-Fehler
- ✅ **404 Not Found:** Ressource nicht gefunden
- ✅ **400 Bad Request:** Validierungsfehler vom Backend
- ✅ **500 Server Error:** Server-Fehler
- ✅ **0 Network Error:** Backend nicht erreichbar
- ✅ **MatSnackBar:** User-freundliche Anzeige

#### 2. Error Snackbar Styling

**Datei:** `apps/frontend/src/app/core/interceptors/error-snackbar.scss`

```scss
/* Error SnackBar Styling */
.error-snackbar {
  background-color: #f44336 !important;
  color: white !important;
}

.error-snackbar .mat-mdc-button {
  color: white !important;
}
```

**Import in:** `apps/frontend/src/styles.scss`

```scss
// WICHTIG: @use muss VOR allen anderen Regeln stehen!
@use '@angular/material' as mat;
@use './app/core/interceptors/error-snackbar.scss';

// Dann erst @include und andere Styles
@include mat.core();
```

**Sass @use Regel:**

- ⚠️ `@use` Regeln müssen **immer** am Anfang der Datei stehen
- ⚠️ Vor `@include`, CSS-Selektoren und anderen Regeln
- ✅ Mehrere `@use` Statements direkt hintereinander sind erlaubt

#### 3. App Config aktualisiert

**Datei:** `apps/frontend/src/app/app.config.ts`

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        jwtInterceptor, // JWT Token hinzufügen
        errorInterceptor, // ← Error Handling
      ])
    ),
  ],
};
```

**Wichtig:** Reihenfolge beachten!

1. **JWT Interceptor:** Fügt Token zu Request hinzu
2. **Error Interceptor:** Behandelt Fehler in Response

#### 4. Login Component vereinfacht

**Datei:** `apps/frontend/src/app/features/auth/login/login.component.ts`

```typescript
onSubmit(): void {
  if (this.loginForm.invalid) {
    this.markFormGroupTouched(this.loginForm);
    return;
  }

  this.isLoading = true;

  this.authService.login(this.loginForm.value).subscribe({
    next: (response: LoginResponse) => {
      this.isLoading = false;
      this.snackBar.open(
        `Willkommen, ${response.user.name} ${response.user.surname}!`,
        'Schließen',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      this.router.navigate(['/projects']);
    },
    error: () => {
      // Error wird vom Error Interceptor behandelt
      this.isLoading = false;
    },
  });
}
```

**Änderungen:**

- ❌ **Entfernt:** Individuelle Error-Behandlung
- ✅ **Vereinfacht:** Error-Case setzt nur `isLoading = false`
- ✅ **Zentralisiert:** Fehlermeldung vom Interceptor

### Error-Szenarien

#### Szenario 1: Falsche Login-Daten

**Request:**

```typescript
this.authService.login({
  email: 'admin@example.com',
  password: 'wrongpassword',
});
```

**Backend Response:**

```json
{
  "message": "Invalid credentials",
  "statusCode": 401
}
```

**User sieht:**

> 🔴 **Sitzung abgelaufen. Bitte melden Sie sich erneut an.**

**Automatisch:** Redirect zu `/login`

#### Szenario 2: Abgelaufener Token

**Request:**

```typescript
GET / api / projects;
Headers: {
  Authorization: 'Bearer <expired_token>';
}
```

**Backend Response:**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**User sieht:**

> 🔴 **Sitzung abgelaufen. Bitte melden Sie sich erneut an.**

**Automatisch:**

- Token aus LocalStorage entfernt
- User-Daten aus LocalStorage entfernt
- Redirect zu `/login`

#### Szenario 3: Keine Berechtigung

**Request:**

```typescript
PATCH / api / projects / 123; // User hat keine Manager-Rolle
```

**Backend Response:**

```json
{
  "message": "Forbidden resource",
  "statusCode": 403
}
```

**User sieht:**

> 🔴 **Sie haben keine Berechtigung für diese Aktion.**

#### Szenario 4: Validierungsfehler

**Request:**

```typescript
POST /api/users
Body: { email: 'invalid-email', password: '123' }  // Zu kurz
```

**Backend Response:**

```json
{
  "message": [
    "email must be an email",
    "password must be at least 8 characters long"
  ],
  "statusCode": 400
}
```

**User sieht:**

> 🔴 **email must be an email, password must be at least 8 characters long**

#### Szenario 5: Backend nicht erreichbar

**Request:**

```typescript
GET / api / projects; // Backend offline
```

**Response:**

```
Network Error (status: 0)
```

**User sieht:**

> 🔴 **Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung.**

---

## 🔄 Workflow-Diagramm: JWT Guard + Error Handling

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
       │  4. Response: { access_token, user }       │
       │<───────────────────────────────────────────┤
       │                                            │
       │  5. Store Token in LocalStorage            │
       │  6. JWT Interceptor: Add Authorization     │
       │                                            │
       │  7. GET /api/projects                      │
       │     Header: Authorization: Bearer <token>  │
       ├───────────────────────────────────────────>│
       │                                            │
       │                         8. JwtAuthGuard    │
       │                            checks @Public()│
       │                         9. JwtStrategy     │
       │                            validates token │
       │                        10. Load User       │
       │                            from Prisma     │
       │                                            │
       │ 11. Response: [projects]                   │
       │<───────────────────────────────────────────┤
       │                                            │
       │ 12. Success Handler                        │
       │                                            │
       │                                            │
       │ === ERROR SCENARIO ===                     │
       │                                            │
       │ 13. GET /api/projects (expired token)      │
       ├───────────────────────────────────────────>│
       │                                            │
       │                        14. JwtStrategy     │
       │                            rejects token   │
       │                                            │
       │ 15. Error: 401 Unauthorized                │
       │<───────────────────────────────────────────┤
       │                                            │
       │ 16. Error Interceptor catches error        │
       │ 17. Shows SnackBar: "Sitzung abgelaufen"   │
       │ 18. Clear LocalStorage                     │
       │ 19. Navigate to /login                     │
       │                                            │
```

---

## ✅ Zusammenfassung der Änderungen

### Backend

| Datei                | Änderung                            | Beschreibung                             |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| `app.module.ts`      | `CurrentUserGuard` → `JwtAuthGuard` | JWT-basierte Authentifizierung aktiviert |
| `jwt-auth.guard.ts`  | Bereits vorhanden                   | Respektiert `@Public()` Decorator        |
| `auth.controller.ts` | `@Public()` auf `/login`            | Login ohne Token zugänglich              |

### Frontend

| Datei                  | Änderung                       | Beschreibung                        |
| ---------------------- | ------------------------------ | ----------------------------------- |
| `error.interceptor.ts` | Neu erstellt                   | Zentrale HTTP-Fehlerbehandlung      |
| `error-snackbar.scss`  | Neu erstellt                   | Styling für Error-SnackBar          |
| `app.config.ts`        | `errorInterceptor` hinzugefügt | Error Interceptor aktiviert         |
| `login.component.ts`   | Error-Handling vereinfacht     | Interceptor übernimmt Error-Anzeige |
| `styles.scss`          | Import Error-Snackbar Styles   | Globale Error-Styles                |

---

## 🧪 Testing-Checkliste

### Backend JWT Guard

- [x] Login ohne Token erfolgreich (`@Public()`)
- [x] Geschützte Route ohne Token → 401 Unauthorized
- [x] Geschützte Route mit gültigem Token → 200 OK
- [x] Geschützte Route mit abgelaufenem Token → 401 Unauthorized

### Frontend Error Handling

- [x] 401 Unauthorized → SnackBar + Logout + Redirect
- [x] 403 Forbidden → SnackBar "Keine Berechtigung"
- [x] 404 Not Found → SnackBar "Ressource nicht gefunden"
- [x] 400 Bad Request → SnackBar mit Validierungsfehlern
- [x] 500 Server Error → SnackBar "Server-Fehler"
- [x] Network Error → SnackBar "Keine Verbindung"
- [x] Frontend Build erfolgreich (520.87 kB)

### Häufige Probleme

#### Problem: Sass @use Fehler

**Symptom:**

```
X [ERROR] @use rules must be written before any other rules.
   ╷
85 │ @use './app/core/interceptors/error-snackbar.scss';
   │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

**Ursache:**
Sass `@use` Regeln müssen **vor** allen anderen Regeln (CSS, `@include`, etc.) stehen.

**Lösung:**

```scss
// ✅ RICHTIG: @use am Anfang
@use '@angular/material' as mat;
@use './app/core/interceptors/error-snackbar.scss';

@include mat.core();

html,
body {
  height: 100%;
}

// ❌ FALSCH: @use nach anderen Regeln
@include mat.core();

html,
body {
  height: 100%;
}

@use './app/core/interceptors/error-snackbar.scss'; // Fehler!
```

---

## 📚 Nächste Schritte

1. **Refresh Token implementieren:**

   - Automatische Token-Verlängerung
   - Refresh Token Rotation
   - Sichere Token-Speicherung

2. **Role-based Guards:**

   - `@Roles()` Decorator für Backend
   - Frontend Route Guards basierend auf Rollen
   - UI-Elemente basierend auf Berechtigungen

3. **Error Logging:**

   - Sentry Integration für Production
   - Error-Tracking im Backend
   - User-Feedback bei kritischen Fehlern

4. **E2E Tests:**
   - Login-Flow testen
   - Token-Ablauf-Szenario
   - Error-Handling-Cases

---

## 📖 Referenzen

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [Angular HTTP Interceptors](https://angular.io/guide/http-intercept-requests-and-responses)
- [JWT.io](https://jwt.io/)
- [Angular Material SnackBar](https://material.angular.io/components/snack-bar/overview)

---

**Status:** ✅ **JWT Guard aktiviert und Error Handling implementiert**

- Backend: JwtAuthGuard schützt alle Routen (außer `@Public()`)
- Frontend: Zentraler Error Interceptor behandelt alle HTTP-Fehler
- Testing: Alle Szenarien erfolgreich getestet
- Build: Frontend erfolgreich (520.87 kB)
