# Layout-Integration für geschützte Routen

**Datum:** 17. November 2025  
**Projekt:** Issue Tracker Frontend (Angular + Nx)  
**Ziel:** Layout für alle Routen außer Login aktivieren

---

## 📋 Übersicht

Diese Dokumentation beschreibt die Implementierung eines gemeinsamen Layouts (Header, Sidebar, Footer) für alle geschützten Routen, während die Login-Seite **ohne** Layout angezeigt wird.

---

## 🎯 Anforderungen

- ✅ Login-Seite **ohne** Layout (nur Formular)
- ✅ Alle anderen Routen (Projects, Tickets, etc.) **mit** Layout
- ✅ Layout enthält: Header, Sidebar, Content-Bereich, Footer
- ✅ Navigation zwischen Seiten **ohne** Layout-Reload (Performance)
- ✅ Auth Guard schützt alle Layout-Routen zentral

---

## 🏗️ Architektur-Konzept

### **Route-Hierarchie**

```
App Root
│
├── Login (OHNE Layout, Public)
│   └── URL: /login
│
└── Layout Component (MIT Layout, Protected)
    ├── Projects (Child Route)
    │   └── URL: /projects
    ├── Tickets (Child Route)
    │   └── URL: /tickets
    └── Dashboard (Child Route)
        └── URL: /dashboard
```

### **Nested Routes (Verschachtelte Routen)**

Das Konzept basiert auf **Nested Routes**:

- Die **Parent Route** (`path: ''`) lädt das Layout Component
- **Child Routes** (`children: [...]`) werden **innerhalb** des Layouts geladen
- Das Layout hat ein `<router-outlet>`, wo die Children angezeigt werden

---

## 🔧 Implementierte Änderungen

### **1. Route-Konfiguration (`app.routes.ts`)**

#### **Vorher:**

```typescript
export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-list/project-list').then(
        (m) => m.ProjectList
      ),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
```

**Problem:**

- Jede Route ist auf **Root-Ebene**
- Kein gemeinsames Layout möglich
- Auth Guard muss auf **jeder Route** separat angewendet werden

---

#### **Nachher:**

```typescript
export const appRoutes: Route[] = [
  // Login Route (public, ohne Layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },

  // Layout Route (Wrapper für alle geschützten Seiten)
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list/project-list').then(
            (m) => m.ProjectList
          ),
      },
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
    ],
  },

  // Wildcard route - redirect to login
  {
    path: '**',
    redirectTo: 'login',
  },
];
```

**Änderungen:**

1. **Login-Route auf Root-Ebene:**

   ```typescript
   { path: 'login', loadComponent: ... }
   ```

   - Bleibt eigenständig, **kein Layout**

2. **Layout-Route mit leerem Pfad:**

   ```typescript
   { path: '', loadComponent: () => import('./core/layout/layout')... }
   ```

   - `path: ''` = matcht alle URLs außer `/login`
   - Lädt das Layout Component als **Wrapper**

3. **Children Array:**

   ```typescript
   children: [
     { path: 'projects', loadComponent: ... },
   ]
   ```

   - Definiert **Routen innerhalb des Layouts**
   - Werden im `<router-outlet>` des Layouts angezeigt

4. **Auth Guard zentral:**

   ```typescript
   canActivate: [authGuard],
   ```

   - Auf **Layout-Route** angewendet
   - Schützt automatisch **alle Children** (Projects, Tickets, etc.)

5. **Default-Redirect:**
   ```typescript
   { path: '', redirectTo: 'projects', pathMatch: 'full' }
   ```
   - Beim Navigieren zu `/` → Redirect zu `/projects`

---

### **2. Layout Component (`layout.ts`)**

#### **Code:**

```typescript
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatToolbarModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

**Wichtige Punkte:**

1. **`RouterOutlet` Import:**

   ```typescript
   imports: [RouterOutlet, ...]
   ```

   - **Zwingend erforderlich** für `<router-outlet>` im Template
   - Ohne diesen Import funktioniert das Routing nicht

2. **`AuthService` Injection:**

   ```typescript
   constructor(private authService: AuthService, private router: Router) {}
   ```

   - Services werden **nicht** in `imports` Array aufgenommen
   - Nur im `constructor` injiziert

3. **`logout()` Methode:**
   ```typescript
   logout(): void {
     this.authService.logout();
     this.router.navigate(['/login']);
   }
   ```
   - Ruft `authService.logout()` auf (löscht Token)
   - Navigiert zurück zu Login

---

### **3. Layout Template (`layout.html`)**

#### **Aktueller Stand:**

```html
<div class="layout-container">
  <mat-sidenav-container class="sidenav-container">
    <mat-sidenav class="sidenav">
      <mat-toolbar class="sidebar-header"> </mat-toolbar>
    </mat-sidenav>
    <mat-sidenav-content>
      <ng-content></ng-content>
    </mat-sidenav-content>
  </mat-sidenav-container>

  <main>
    <router-outlet></router-outlet>
    <!-- Feature-Content wird hier geladen -->
  </main>
</div>
```

**Wichtig:** Das `<router-outlet></router-outlet>` ist **zwingend erforderlich**!

**Funktionsweise:**

- URL `/projects` → Router lädt `ProjectList` Component
- `ProjectList` wird **im `<router-outlet>` angezeigt**
- Header/Sidebar/Footer vom Layout bleiben konstant

---

## 🔄 Routing-Ablauf

### **Beispiel: Navigation zu `/projects`**

```
1. User navigiert zu /projects
         ↓
2. Router prüft Route-Konfiguration
         ↓
3. Findet path: '' (Layout-Route)
         ↓
4. Auth Guard wird ausgeführt
         ↓
   ┌──────────────────────┐
   │ Ist User eingeloggt? │
   └──────────────────────┘
         ↓ Ja
5. Layout Component wird geladen
   (Header, Sidebar, Footer)
         ↓
6. Router sucht in children[] nach 'projects'
         ↓
7. ProjectList Component wird geladen
         ↓
8. ProjectList wird in <router-outlet> des Layouts angezeigt
         ↓
   ┌─────────────────────────────┐
   │ User sieht:                 │
   │ ┌─────────────────────────┐ │
   │ │ Header (aus Layout)     │ │
   │ ├─────────────────────────┤ │
   │ │ Sidebar │ ProjectList   │ │
   │ │ (Layout)│ (Child Route) │ │
   │ ├─────────────────────────┤ │
   │ │ Footer (aus Layout)     │ │
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
```

### **Beispiel: Navigation zu `/login`**

```
1. User navigiert zu /login
         ↓
2. Router findet path: 'login'
         ↓
3. Login Component wird direkt geladen (KEINE Children!)
         ↓
4. Kein Layout, kein Auth Guard
         ↓
   ┌─────────────────────────────┐
   │ User sieht:                 │
   │ ┌─────────────────────────┐ │
   │ │                         │ │
   │ │    Login-Formular       │ │
   │ │    (kein Layout)        │ │
   │ │                         │ │
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
```

---

## 🧪 Testing & Verifikation

### **Test 1: Build erfolgreich**

```bash
npx nx build frontend
```

**Ergebnis:**

```
✔ Building...
Initial chunk files   | Names         |  Raw size | Estimated transfer size
...
Lazy chunk files      | Names         |  Raw size | Estimated transfer size
chunk-AWYWNIVJ.js     | layout        |  30.54 kB |                 5.81 kB
chunk-YZ2SGURH.js     | login         | 138.35 kB |                26.33 kB
chunk-5M75UFM3.js     | project-list  | 544 bytes |               544 bytes

 NX   Successfully ran target build for project frontend (3s)
```

✅ **Layout wird als separater Lazy Chunk geladen** (30.54 kB)  
✅ **Login und ProjectList sind ebenfalls lazy-loaded**

---

### **Test 2: Login ohne Layout**

**Schritte:**

1. Browser öffnen: `http://localhost:4200/login`
2. Seite sollte **nur** Login-Formular anzeigen
3. **Kein** Header, Sidebar oder Footer

**Erwartung:** ✅ Nur Login-Component sichtbar

---

### **Test 3: Projects mit Layout**

**Schritte:**

1. Einloggen mit `admin@example.com` / `Admin123!`
2. Nach Login wird automatisch zu `/projects` umgeleitet
3. Seite sollte Layout + ProjectList anzeigen

**Erwartung:**

- ✅ Layout (Header, Sidebar, Footer) sichtbar
- ✅ ProjectList im Content-Bereich
- ✅ Keine Fehlermeldungen in Console

---

### **Test 4: Navigation innerhalb Layout**

**Schritte:**

1. Auf `/projects` eingeloggt sein
2. Navigation zu `/tickets` (sobald implementiert)
3. Beobachten, dass **nur** Content-Bereich wechselt

**Erwartung:**

- ✅ Header/Sidebar/Footer bleiben **unverändert** (kein Reload)
- ✅ Nur Content-Bereich zeigt neue Component
- ✅ Schnelle Navigation (Layout wird gecacht)

---

### **Test 5: Auth Guard Schutz**

**Schritte:**

1. Ausloggen oder neuer Browser-Tab
2. Direkt zu `http://localhost:4200/projects` navigieren (ohne Login)
3. Auth Guard sollte greifen

**Erwartung:**

- ✅ Redirect zu `/login`
- ✅ Fehlermeldung oder Login-Prompt
- ✅ Kein Zugriff auf `/projects` ohne Token

---

## 📊 Vorteile dieser Architektur

### **1. Performance**

| Aspekt               | Ohne Nested Routes   | Mit Nested Routes ✅         |
| -------------------- | -------------------- | ---------------------------- |
| **Layout laden**     | Bei jeder Navigation | Nur einmal                   |
| **Bundle Splitting** | Monolithisch         | Granular (Layout = 30.54 kB) |
| **Memory Usage**     | Höher                | Niedriger                    |
| **Navigation Speed** | Langsamer            | **Schneller**                |

---

### **2. Code-Organisation**

**Vorher:**

```
app/
├── features/
│   ├── projects/
│   │   └── project-list.component.ts  ← Header/Footer hier?
│   └── tickets/
│       └── ticket-list.component.ts   ← Header/Footer dupliziert?
```

**Nachher:**

```
app/
├── core/
│   └── layout/                        ← Layout einmal definiert
│       └── layout.component.ts
└── features/
    ├── projects/
    │   └── project-list.component.ts  ← Nur Content, kein Layout
    └── tickets/
        └── ticket-list.component.ts   ← Nur Content, kein Layout
```

✅ **Keine Code-Duplikation**  
✅ **Separation of Concerns** (Layout vs. Feature-Content)

---

### **3. Security (Auth Guard)**

**Vorher:**

```typescript
{ path: 'projects', canActivate: [authGuard], ... },
{ path: 'tickets', canActivate: [authGuard], ... },
{ path: 'dashboard', canActivate: [authGuard], ... },
// Guard muss auf JEDER Route wiederholt werden
```

**Nachher:**

```typescript
{
  path: '',
  canActivate: [authGuard],  // ← Einmal definiert
  children: [
    { path: 'projects', ... },   // ← Automatisch geschützt
    { path: 'tickets', ... },    // ← Automatisch geschützt
    { path: 'dashboard', ... },  // ← Automatisch geschützt
  ]
}
```

✅ **Ein Guard schützt alle Children**  
✅ **Weniger Fehleranfällig** (kein vergessener Guard)

---

## 🔑 Schlüsselkonzepte

### **1. Router Outlet**

```html
<router-outlet></router-outlet>
```

**Zweck:**

- **Platzhalter** für dynamisch geladene Components
- Angular Router injiziert Components **in** dieses Element
- Kann verschachtelt sein (Parent → Child Outlets)

**Im Layout:**

- Layout hat ein `<router-outlet>`
- Children (Projects, Tickets) werden **dort** angezeigt

**Im App Root:**

- `app.component.html` hat ebenfalls ein `<router-outlet>`
- Top-Level Routes (Login oder Layout) werden **dort** angezeigt

---

### **2. Lazy Loading**

```typescript
loadComponent: () => import('./core/layout/layout').then((m) => m.Layout);
```

**Vorteile:**

- Component wird **nur** geladen, wenn Route besucht wird
- Initial Bundle bleibt klein
- Bessere Performance (kürzere Load-Zeit)

**Build-Output:**

```
Lazy chunk files      | Names         |  Raw size
chunk-AWYWNIVJ.js     | layout        |  30.54 kB
chunk-YZ2SGURH.js     | login         | 138.35 kB
chunk-5M75UFM3.js     | project-list  | 544 bytes
```

Jede Route = eigener Chunk = lädt nur bei Bedarf

---

### **3. Children Routes**

```typescript
{
  path: '',
  component: Layout,
  children: [
    { path: 'projects', component: ProjectList }
  ]
}
```

**Funktionsweise:**

- Parent Route (`path: ''`) lädt `Layout`
- Child Route (`path: 'projects'`) lädt `ProjectList`
- `ProjectList` wird **innerhalb** von `Layout` angezeigt (im `<router-outlet>`)

**URL-Mapping:**

- `/projects` → Layout + ProjectList
- `/tickets` → Layout + TicketList
- Beide nutzen **dasselbe** Layout (kein Reload)

---

## 🚀 Nächste Schritte

### **1. Layout erweitern**

Das Layout ist aktuell minimal. Du kannst es erweitern mit:

- **Header:**

  - App-Titel
  - User-Anzeige (Name, Avatar)
  - Logout-Button
  - Breadcrumbs

- **Sidebar:**

  - Navigation-Links (Projects, Tickets, Dashboard)
  - Icons (Material Icons)
  - Collapsible Sections
  - User-Rolle-basierte Menüpunkte

- **Footer:**
  - Copyright-Hinweis
  - Version-Nummer
  - Links (Impressum, Datenschutz)

**Beispiel-Template:**

```html
<mat-sidenav-container class="layout-container">
  <!-- Sidebar -->
  <mat-sidenav mode="side" opened>
    <mat-nav-list>
      <a mat-list-item routerLink="/projects">
        <mat-icon>folder</mat-icon>
        <span>Projekte</span>
      </a>
      <a mat-list-item routerLink="/tickets">
        <mat-icon>assignment</mat-icon>
        <span>Tickets</span>
      </a>
    </mat-nav-list>
  </mat-sidenav>

  <!-- Main Content -->
  <mat-sidenav-content>
    <!-- Header -->
    <mat-toolbar color="primary">
      <span>Issue Tracker</span>
      <span class="spacer"></span>
      <button mat-button (click)="logout()">Logout</button>
    </mat-toolbar>

    <!-- Content Area -->
    <main class="content">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2025 Issue Tracker</p>
    </footer>
  </mat-sidenav-content>
</mat-sidenav-container>
```

---

### **2. Weitere Features hinzufügen**

**Neue Routes als Children:**

```typescript
children: [
  { path: 'projects', loadComponent: ... },
  { path: 'tickets', loadComponent: ... },      // ← Neu
  { path: 'dashboard', loadComponent: ... },    // ← Neu
  { path: 'users', loadComponent: ... },        // ← Neu (Admin only)
]
```

Alle werden **automatisch** mit Layout angezeigt!

---

### **3. Responsive Design**

**Material Sidenav Modi:**

```html
<mat-sidenav
  [mode]="mobileQuery.matches ? 'over' : 'side'"
  [opened]="!mobileQuery.matches"
></mat-sidenav>
```

**TypeScript:**

```typescript
mobileQuery: MediaQueryList;

constructor(media: MediaMatcher) {
  this.mobileQuery = media.matchMedia('(max-width: 600px)');
}
```

---

## 📚 Zusammenfassung

### **Implementierte Änderungen:**

1. ✅ Route-Struktur umgebaut zu **Nested Routes**
2. ✅ Layout Component als **Wrapper** für geschützte Routen
3. ✅ Login bleibt **außerhalb** des Layouts (eigenständig)
4. ✅ Auth Guard **zentral** auf Layout-Route
5. ✅ `<router-outlet>` im Layout für Children
6. ✅ Build erfolgreich, Lazy Loading funktioniert

### **Vorteile:**

- 🚀 **Performance:** Layout wird einmal geladen, bleibt gecacht
- 🔒 **Security:** Ein Guard schützt alle Routen
- 🧹 **Clean Code:** Keine Layout-Duplikation in Features
- 📦 **Bundle Splitting:** Layout als separater Chunk (30.54 kB)
- 🎯 **Skalierbar:** Neue Features einfach als Children hinzufügen

### **Wie es funktioniert:**

```
URL: /projects
    ↓
1. Router lädt Layout Component (path: '')
    ↓
2. Auth Guard prüft Login-Status
    ↓
3. Layout rendert (Header, Sidebar, Footer)
    ↓
4. Router sucht Child Route 'projects'
    ↓
5. ProjectList wird in <router-outlet> geladen
    ↓
Ergebnis: Layout + ProjectList zusammen sichtbar
```

---

**Erstellt am:** 17. November 2025  
**Build-Status:** ✅ Erfolgreich (531.24 kB Bundle)  
**Lazy Chunks:** Layout (30.54 kB), Login (138.35 kB), ProjectList (544 bytes)
