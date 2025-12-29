# 🔐 Login-UI Implementation - Dokumentation

Diese Anleitung dokumentiert die vollständige Implementierung der Login-Weboberfläche mit Angular Material im Issue Tracker Frontend.

---

## 📋 Übersicht

Die Login-UI wurde mit folgenden Features implementiert:

- ✅ **Material Design UI** - Moderne, responsive Login-Oberfläche
- ✅ **Formular-Validierung** - Email & Passwort mit Echtzeit-Feedback
- ✅ **JWT Authentication** - Token-basierte Authentifizierung
- ✅ **Auth Service** - Zentrale Verwaltung von Login/Logout
- ✅ **HTTP Interceptor** - Automatisches Hinzufügen des JWT-Tokens
- ✅ **Auth Guard** - Schutz geschützter Routen
- ✅ **Loading States** - Visuelles Feedback während Login
- ✅ **Error Handling** - Benutzerfreundliche Fehlermeldungen

---

## 🏗️ Architektur

### **Verzeichnisstruktur**

```
apps/frontend/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts              # Route Guard für Authentication
│   ├── interceptors/
│   │   └── jwt.interceptor.ts         # HTTP Interceptor für JWT-Token
│   └── services/
│       └── auth.service.ts            # Authentication Service
├── features/
│   ├── auth/
│   │   └── login/
│   │       ├── login.component.ts     # Login Component
│   │       ├── login.component.html   # Login Template
│   │       └── login.component.scss   # Login Styles
│   └── projects/
│       └── project-list/
│           └── project-list.component.ts  # Placeholder (geschützte Route)
├── app.config.ts                      # App-Konfiguration mit Interceptor
└── app.routes.ts                      # Routing-Konfiguration
```

---

## 🔧 Implementierte Komponenten

### **1. Auth Service** (`core/services/auth.service.ts`)

**Zweck:** Zentrale Verwaltung der Authentifizierung

**Features:**

- ✅ Login mit Email/Passwort
- ✅ JWT-Token in LocalStorage speichern
- ✅ User-Daten in LocalStorage speichern
- ✅ Observable für Login-Status (`isAuthenticated$`)
- ✅ Observable für aktuellen User (`currentUser$`)
- ✅ Logout-Funktion
- ✅ Error-Handling mit benutzerfreundlichen Meldungen

**Wichtige Methoden:**

```typescript
// Login durchführen
login(credentials: LoginRequest): Observable<LoginResponse>

// Logout durchführen
logout(): void

// Login-Status prüfen
isLoggedIn(): boolean

// JWT-Token abrufen
getToken(): string | null

// Aktuellen User abrufen
getCurrentUser(): User | null
```

**API-Endpoint:**

```
POST http://localhost:3000/api/auth/login
```

**LocalStorage Keys:**

- `jwt_token` - JWT Access Token
- `current_user` - User-Daten (JSON)

---

### **2. Login Component** (`features/auth/login/login.component.ts`)

**Zweck:** Login-Formular mit Material Design

**Material Components verwendet:**

- `MatCardModule` - Card-Container
- `MatFormFieldModule` - Form Fields
- `MatInputModule` - Input Fields
- `MatButtonModule` - Submit Button
- `MatIconModule` - Icons (Email, Lock, Visibility)
- `MatProgressSpinnerModule` - Loading Indicator
- `MatSnackBarModule` - Toast Notifications

**Formular-Validierung:**

```typescript
loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
});
```

**Validierungs-Regeln:**

- Email: Pflichtfeld, muss gültige Email sein
- Passwort: Pflichtfeld, mindestens 6 Zeichen

**Features:**

- ✅ Echtzeit-Validierung
- ✅ Custom Error Messages
- ✅ Password Visibility Toggle
- ✅ Loading State während Login
- ✅ Success/Error Notifications (Snackbar)
- ✅ Auto-Navigation nach Login

---

### **3. JWT Interceptor** (`core/interceptors/jwt.interceptor.ts`)

**Zweck:** Automatisches Hinzufügen des JWT-Tokens zu HTTP-Requests

**Funktionsweise:**

```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
```

**Was passiert:**

1. Interceptor wird bei jedem HTTP-Request ausgeführt
2. JWT-Token wird aus LocalStorage geladen
3. Token wird als `Authorization: Bearer <token>` Header hinzugefügt
4. Request wird weitergeleitet

**Registrierung in `app.config.ts`:**

```typescript
provideHttpClient(withInterceptors([jwtInterceptor]));
```

---

### **4. Auth Guard** (`core/guards/auth.guard.ts`)

**Zweck:** Schützt Routen vor unautorisiertem Zugriff

**Funktionsweise:**

```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

**Was passiert:**

1. Guard prüft ob User eingeloggt ist
2. Wenn ja → Route wird aktiviert
3. Wenn nein → Redirect zu `/login`

**Verwendung in Routes:**

```typescript
{
  path: 'projects',
  canActivate: [authGuard],
  loadComponent: () => import('./features/projects/...')
}
```

---

### **5. Routing** (`app.routes.ts`)

**Route-Konfiguration:**

```typescript
export const appRoutes: Route[] = [
  // Root → Login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Login (öffentlich)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component'),
  },

  // Projects (geschützt)
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component'),
  },

  // Wildcard → Login
  { path: '**', redirectTo: '/login' },
];
```

**Features:**

- ✅ Lazy Loading (Komponenten werden bei Bedarf geladen)
- ✅ Auth Guard für geschützte Routen
- ✅ Wildcard-Route für 404-Handling

---

## 🎨 UI Design

### **Login-Screen Features:**

**Layout:**

- Zentrierte Card auf Gradient-Hintergrund
- Responsive Design (Desktop & Mobile)
- Elevation & Shadow für Tiefe

**Formular:**

- Outlined Material Form Fields
- Icons für Email & Passwort
- Password Visibility Toggle
- Echtzeit-Validierung mit Error Messages

**Button:**

- Raised Button (Primary Color)
- Loading Spinner während Request
- Disabled State während Loading

**Feedback:**

- Success Snackbar nach Login
- Error Snackbar bei Fehler
- Hint-Text für Test-Accounts

**Farben:**

- Primary: Indigo (#3f51b5)
- Accent: Pink
- Gradient: Purple to Blue
- Error: Red (#f44336)

---

## 🔄 Login-Flow

### **1. User öffnet App:**

```
/ → Redirect zu /login
```

### **2. User gibt Credentials ein:**

```
Email: admin@example.com
Passwort: Admin123!
```

### **3. Submit-Button:**

- Formular-Validierung
- Loading Spinner anzeigen
- HTTP POST zu `/api/auth/login`

### **4. Backend-Response:**

```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Test",
    "surname": "Admin",
    "role": "ADMIN"
  }
}
```

### **5. AuthService:**

- Token in LocalStorage speichern
- User in LocalStorage speichern
- Observables aktualisieren

### **6. Navigation:**

- Success Snackbar: "Willkommen, Test Admin!"
- Redirect zu `/projects`

### **7. Auth Guard:**

- Prüft Token in LocalStorage
- Erlaubt Zugriff auf `/projects`

### **8. Zukünftige Requests:**

- JWT Interceptor fügt Token automatisch hinzu
- Backend erkennt authentifizierten User

---

## 📦 Verwendete Material Components

| Component                  | Verwendung                    |
| -------------------------- | ----------------------------- |
| `MatCardModule`            | Login-Card Container          |
| `MatFormFieldModule`       | Form Field Wrapper            |
| `MatInputModule`           | Email & Password Inputs       |
| `MatButtonModule`          | Submit Button                 |
| `MatIconModule`            | Email, Lock, Visibility Icons |
| `MatProgressSpinnerModule` | Loading Indicator             |
| `MatSnackBarModule`        | Toast Notifications           |

**Import in `login.component.ts`:**

```typescript
imports: [
  CommonModule,
  ReactiveFormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
];
```

---

## 🧪 Testing

### **Test-Accounts (aus Backend-Seed):**

| Email                   | Passwort        | Rolle     |
| ----------------------- | --------------- | --------- |
| `admin@example.com`     | `Admin123!`     | ADMIN     |
| `manager@example.com`   | `Manager123!`   | MANAGER   |
| `developer@example.com` | `Developer123!` | DEVELOPER |
| `reporter@example.com`  | `Reporter123!`  | REPORTER  |

### **Test-Szenarien:**

**1. Erfolgreicher Login:**

```
1. Frontend öffnen: http://localhost:4200
2. Email: admin@example.com
3. Passwort: Admin123!
4. Klick auf "Anmelden"
5. ✅ Success Snackbar erscheint
6. ✅ Redirect zu /projects
7. ✅ Token in LocalStorage gespeichert
```

**2. Ungültige Credentials:**

```
1. Email: admin@example.com
2. Passwort: WrongPassword
3. Klick auf "Anmelden"
4. ✅ Error Snackbar: "Ungültige Anmeldedaten"
5. ✅ Kein Redirect
```

**3. Formular-Validierung:**

```
1. Email leer lassen
2. Tab zu Passwort
3. ✅ Error: "Email ist erforderlich"

1. Email: invalid-email
2. ✅ Error: "Ungültige Email-Adresse"

1. Passwort: 123
2. ✅ Error: "Passwort muss mindestens 6 Zeichen lang sein"
```

**4. Auth Guard:**

```
1. Direkt zu /projects navigieren (ohne Login)
2. ✅ Redirect zu /login
3. Nach Login:
4. ✅ Zugriff zu /projects erlaubt
```

**5. JWT Interceptor:**

```
1. Login durchführen
2. DevTools → Network
3. Beliebigen API-Request beobachten
4. ✅ Authorization: Bearer eyJhbGci... Header vorhanden
```

---

## 📱 Responsive Design

### **Desktop (>600px):**

- Login Card: 450px Breite
- Großzügiger Padding
- Große Icons & Fonts

### **Mobile (<600px):**

- Login Card: 100% Breite
- Reduzierter Padding
- Kleinere Icons & Fonts
- Touch-optimierte Buttons

**Media Query:**

```scss
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 16px;
  }
}
```

---

## 🔒 Sicherheit

### **Token-Speicherung:**

- ✅ JWT-Token in LocalStorage (XSS-Risiko beachten)
- ⚠️ Alternative: HttpOnly Cookies (sicherer)

### **HTTPS:**

- ⚠️ In Production: Nur über HTTPS
- ✅ Token wird über verschlüsselte Verbindung übertragen

### **Token-Expiration:**

- Backend: 24h Gültigkeit
- Frontend: Keine automatische Refresh-Logic (noch nicht implementiert)

### **Password-Sichtbarkeit:**

- Toggle-Button für bessere UX
- Default: Passwort verborgen

---

## 🐛 Error-Handling

### **Backend-Fehler:**

| Status | Nachricht                | Ursache                 |
| ------ | ------------------------ | ----------------------- |
| 401    | Ungültige Anmeldedaten   | Falsches Passwort/Email |
| 0      | Backend nicht erreichbar | Backend offline         |
| 500    | Server-Fehler: 500       | Interner Server-Fehler  |

### **Validierungs-Fehler:**

```typescript
getEmailErrorMessage(): string {
  if (emailControl?.hasError('required')) {
    return 'Email ist erforderlich';
  }
  if (emailControl?.hasError('email')) {
    return 'Ungültige Email-Adresse';
  }
  return '';
}
```

---

## 🚀 Build & Deploy

### **Development Build:**

```bash
npx nx serve frontend
# Frontend: http://localhost:4200
```

### **Production Build:**

```bash
npx nx build frontend
```

**Build-Output:**

```
Initial chunk files   | Raw size | Transfer size
chunk-7NO6QFIM.js     | 149.58 kB | 44.67 kB
chunk-OVP4ATZS.js     | 105.41 kB | 26.99 kB
styles-INIVEQWO.css   |  96.23 kB |  7.06 kB
main-AH6GLXNZ.js      |  23.32 kB |  6.92 kB

Initial total         | 419.76 kB | 99.76 kB

Lazy chunk files      | Raw size | Transfer size
chunk-R5JVV42R.js (login) | 256.87 kB | 47.85 kB
```

**Output-Verzeichnis:**

```
dist/apps/frontend/browser/
```

---

## 📚 Code-Beispiele

### **Login-Aufruf in Component:**

```typescript
onSubmit(): void {
  if (this.loginForm.invalid) {
    return;
  }

  this.isLoading = true;

  this.authService.login(this.loginForm.value).subscribe({
    next: (response) => {
      this.snackBar.open(`Willkommen, ${response.user.name}!`, 'Schließen');
      this.router.navigate(['/projects']);
    },
    error: (error) => {
      this.snackBar.open(error.message, 'Schließen', {
        panelClass: ['error-snackbar'],
      });
    },
  });
}
```

### **Auth Guard Verwendung:**

```typescript
// In app.routes.ts
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./features/dashboard/dashboard.component')
}
```

### **Logout implementieren:**

```typescript
// In navbar.component.ts
logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
  this.snackBar.open('Erfolgreich abgemeldet', 'Schließen');
}
```

### **User-Daten anzeigen:**

```typescript
// In header.component.ts
currentUser$ = this.authService.currentUser$;

// In template
<span>{{ (currentUser$ | async)?.name }}</span>
```

---

## 🎯 Nächste Schritte

### **Sofort möglich:**

1. ✅ Login testen mit Test-Accounts
2. ✅ Error-Handling testen
3. ✅ Responsive Design prüfen

### **Zukünftige Erweiterungen:**

1. **Refresh Token Logic** - Automatisches Token-Refresh
2. **Remember Me** - Längere Session-Speicherung
3. **Logout-Button** - In App-Navigation
4. **User-Profil** - Anzeige aktueller User-Daten
5. **Password Reset** - Passwort-Vergessen-Funktion
6. **Email-Verification** - Email-Bestätigung
7. **Two-Factor Auth** - Zusätzliche Sicherheit

---

## ✅ Zusammenfassung

**Was implementiert wurde:**

- ✅ Vollständige Login-UI mit Material Design
- ✅ JWT-basierte Authentifizierung
- ✅ Auth Service mit LocalStorage
- ✅ HTTP Interceptor für automatischen Token-Header
- ✅ Auth Guard für Route-Protection
- ✅ Formular-Validierung mit Echtzeit-Feedback
- ✅ Loading States & Error-Handling
- ✅ Responsive Design (Desktop & Mobile)

**Dateien erstellt/modifiziert:**

- `core/services/auth.service.ts` (neu)
- `core/interceptors/jwt.interceptor.ts` (neu)
- `core/guards/auth.guard.ts` (neu)
- `features/auth/login/login.component.ts` (neu)
- `features/auth/login/login.component.html` (neu)
- `features/auth/login/login.component.scss` (neu)
- `features/projects/project-list/project-list.component.ts` (neu, Placeholder)
- `app.routes.ts` (modifiziert)
- `app.config.ts` (modifiziert)

**Build-Status:**

```
✔ Building successful
Initial total: 419.76 kB (99.76 kB compressed)
```

**Die Login-UI ist vollständig implementiert und einsatzbereit! 🎉**

---

## 🔗 Ressourcen

- [Angular Material Docs](https://material.angular.io/)
- [Angular Forms Guide](https://angular.io/guide/forms)
- [Angular Router Guards](https://angular.io/guide/router#preventing-unauthorized-access)
- [Angular HTTP Interceptors](https://angular.io/guide/http-interceptor-use-cases)
- [JWT Introduction](https://jwt.io/introduction)
