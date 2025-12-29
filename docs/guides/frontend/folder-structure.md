# Frontend Ordnerstruktur - Best Practices

**Datum:** 17. November 2025  
**Projekt:** Issue Tracker Frontend (Angular + Nx)

## 📋 Inhaltsverzeichnis

1. [Grundprinzipien](#grundprinzipien)
2. [Ordnerstruktur Übersicht](#ordnerstruktur-übersicht)
3. [Core Layer](#core-layer)
4. [Shared Layer](#shared-layer)
5. [Features Layer](#features-layer)
6. [Layout-Konzept](#layout-konzept)
7. [Routing-Strategie](#routing-strategie)
8. [Smart vs. Dumb Components](#smart-vs-dumb-components)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)

---

## 🎯 Grundprinzipien

### 1. **Feature-basierte Organisation**

Code wird nach **Features** organisiert, nicht nach Dateityp (Components, Services, etc.).

### 2. **Lazy Loading**

Alle Features werden lazy-loaded für optimale Performance und kleinere initiale Bundle-Größe.

### 3. **Standalone Components**

Moderne Angular-Architektur (seit Angular 14+) ohne NgModules.

### 4. **Klare Trennung**

- **Core**: Singleton-Services, App-weite Funktionalität
- **Shared**: Wiederverwendbare UI-Components
- **Features**: Geschäftslogik, Feature-spezifische Components

### 5. **Single Responsibility**

Jeder Ordner und jede Datei hat eine klare, eindeutige Verantwortung.

---

## 📂 Ordnerstruktur Übersicht

```
apps/frontend/src/app/
│
├── core/                          # ✅ Singleton Services & App-weite Funktionalität
│   ├── guards/                    # Route Guards
│   ├── interceptors/              # HTTP Interceptors
│   ├── services/                  # Singleton Services (Auth, Storage, etc.)
│   ├── layout/                    # App-Layout Components (Header, Sidebar)
│   ├── models/                    # Core Type Definitions
│   └── utils/                     # Helper Functions
│
├── shared/                        # ♻️ Wiederverwendbare Components/Directives/Pipes
│   ├── components/                # UI Components (Button, Card, Dialog, etc.)
│   ├── directives/                # Custom Directives
│   ├── pipes/                     # Custom Pipes
│   └── validators/                # Custom Form Validators
│
├── features/                      # 🚀 Feature Modules (Lazy Loaded)
│   ├── auth/                      # Authentication Feature
│   ├── projects/                  # Projects Feature
│   ├── tickets/                   # Tickets Feature
│   ├── users/                     # User Management Feature
│   └── dashboard/                 # Dashboard Feature
│
├── app.component.ts               # Root Component
├── app.component.html
├── app.component.scss
├── app.config.ts                  # App Configuration (Providers)
└── app.routes.ts                  # Root Routes
```

---

## 🔐 Core Layer

**Zweck:** App-weite Funktionalität, die **nur einmal** geladen wird.

### Struktur

```
core/
├── guards/
│   ├── auth.guard.ts              # ✅ Bereits vorhanden
│   └── role.guard.ts              # Für rollenbasierte Zugriffskontrolle
│
├── interceptors/
│   ├── jwt.interceptor.ts         # ✅ Bereits vorhanden
│   ├── error.interceptor.ts       # ✅ Bereits vorhanden
│   └── loading.interceptor.ts     # Für Loading-Spinner (optional)
│
├── services/
│   ├── auth.service.ts            # ✅ Bereits vorhanden
│   ├── storage.service.ts         # LocalStorage/SessionStorage Wrapper
│   └── notification.service.ts    # Toast/Snackbar Service
│
├── layout/
│   ├── header/
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.scss
│   │
│   ├── sidebar/
│   │   ├── sidebar.component.ts
│   │   ├── sidebar.component.html
│   │   └── sidebar.component.scss
│   │
│   ├── footer/
│   │   ├── footer.component.ts
│   │   ├── footer.component.html
│   │   └── footer.component.scss
│   │
│   └── layout.component.ts        # Main Layout Container
│
├── models/
│   └── app-config.model.ts        # App-spezifische Models
│
└── utils/
    ├── date-utils.ts              # Date Formatting/Parsing
    └── validators.ts              # Common Validators
```

### Regeln

✅ **DOs:**

- Singleton Services (nur eine Instanz app-weit)
- Guards und Interceptors
- Layout-Components
- App-weite Utility Functions

❌ **DON'Ts:**

- Niemals direkt in Features importieren (nur über `app.config.ts`)
- Keine Feature-spezifischen Services

### Beispiel: Core Service Registration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    // Core Services werden automatisch als Singletons bereitgestellt
  ],
};
```

---

## ♻️ Shared Layer

**Zweck:** Wiederverwendbare UI-Components, die in **mehreren Features** verwendet werden.

### Struktur

```
shared/
├── components/
│   ├── button/
│   │   ├── button.component.ts
│   │   ├── button.component.html
│   │   ├── button.component.scss
│   │   └── button.component.spec.ts
│   │
│   ├── card/
│   │   ├── card.component.ts
│   │   └── ...
│   │
│   ├── dialog/
│   │   ├── confirm-dialog/
│   │   │   └── confirm-dialog.component.ts
│   │   └── info-dialog/
│   │       └── info-dialog.component.ts
│   │
│   ├── table/
│   │   ├── data-table/
│   │   │   └── data-table.component.ts
│   │   └── table-pagination/
│   │       └── table-pagination.component.ts
│   │
│   └── form-field/
│       ├── input-field/
│       │   └── input-field.component.ts
│       └── select-field/
│           └── select-field.component.ts
│
├── directives/
│   ├── autofocus.directive.ts
│   ├── click-outside.directive.ts
│   └── permission.directive.ts
│
├── pipes/
│   ├── truncate.pipe.ts
│   ├── time-ago.pipe.ts
│   └── file-size.pipe.ts
│
└── validators/
    ├── email.validator.ts
    └── password-strength.validator.ts
```

### Regeln

✅ **DOs:**

- **Dumme/Presentational Components** (nur Input/Output)
- Standalone Components
- Keine Service-Dependencies
- Wiederverwendbar in mehreren Features

❌ **DON'Ts:**

- Keine Business-Logik
- Keine HTTP-Requests
- Keine Feature-spezifische Logik

### Beispiel: Shared Component

```typescript
// shared/components/button/button.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="'btn btn-' + variant"
      [disabled]="disabled"
      (click)="clicked.emit()"
    >
      {{ label }}
    </button>
  `,
  styles: [
    `
      .btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-primary {
        background-color: #1976d2;
        color: white;
      }
      .btn-secondary {
        background-color: #424242;
        color: white;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() label = '';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}
```

### Verwendung in Features

```typescript
// features/projects/project-list/project-list.component.ts
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <h1>Projects</h1>
    <app-button
      label="Neues Projekt"
      variant="primary"
      (clicked)="createProject()"
    >
    </app-button>
  `,
})
export class ProjectListComponent {
  createProject() {
    console.log('Create new project');
  }
}
```

---

## 🚀 Features Layer

**Zweck:** Funktionale Bereiche der App (Lazy Loaded).

### Struktur pro Feature

```
features/projects/
├── project-list/                  # List View
│   ├── project-list.component.ts
│   ├── project-list.component.html
│   ├── project-list.component.scss
│   └── project-list.component.spec.ts
│
├── project-detail/                # Detail View
│   ├── project-detail.component.ts
│   ├── project-detail.component.html
│   └── project-detail.component.scss
│
├── project-create/                # Create/Edit Form
│   ├── project-create.component.ts
│   └── ...
│
├── components/                    # Feature-spezifische Components
│   ├── project-card/
│   │   └── project-card.component.ts
│   └── project-members/
│       └── project-members.component.ts
│
├── services/                      # Feature-spezifische Services
│   └── projects.service.ts
│
├── models/                        # Feature-spezifische Models
│   └── project-filter.model.ts
│
└── projects.routes.ts             # Feature Routes
```

### Alle Features

```
features/
│
├── auth/                          # ✅ Authentication
│   ├── login/
│   │   ├── login.component.ts     # ✅ Bereits vorhanden
│   │   ├── login.component.html
│   │   └── login.component.scss
│   ├── register/                  # Registrierung (später)
│   └── auth.routes.ts
│
├── dashboard/                     # Dashboard Overview
│   ├── dashboard.component.ts
│   ├── components/
│   │   ├── stats-card/
│   │   └── recent-activity/
│   └── dashboard.routes.ts
│
├── projects/                      # Project Management
│   ├── project-list/
│   ├── project-detail/
│   ├── project-create/
│   ├── services/
│   │   └── projects.service.ts
│   └── projects.routes.ts
│
├── tickets/                       # Ticket/Issue Management
│   ├── ticket-list/
│   ├── ticket-detail/
│   ├── ticket-board/              # Kanban Board
│   ├── ticket-create/
│   ├── components/
│   │   ├── ticket-card/
│   │   ├── ticket-comments/
│   │   └── ticket-activity/
│   ├── services/
│   │   └── tickets.service.ts
│   └── tickets.routes.ts
│
└── users/                         # User Management (Admin)
    ├── user-list/
    ├── user-detail/
    ├── services/
    │   └── users.service.ts
    └── users.routes.ts
```

### Regeln

✅ **DOs:**

- Lazy Loading für alle Features
- Feature-spezifische Services im Feature (nicht in Core)
- Eigene Routes pro Feature
- Smart Components (laden Daten, verwalten State)

❌ **DON'Ts:**

- Keine Cross-Feature Dependencies (außer über Services)
- Keine Shared Components im Feature (gehören nach `/shared`)

### Beispiel: Feature Routes

```typescript
// features/projects/projects.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./project-create/project-create.component').then(
        (m) => m.ProjectCreateComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
  },
];
```

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    component: LayoutComponent, // Layout Wrapper
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(
            (m) => m.PROJECTS_ROUTES
          ),
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./features/tickets/tickets.routes').then(
            (m) => m.TICKETS_ROUTES
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
```

---

## 🎨 Layout-Konzept

### Layout als Core Component

```
core/layout/
├── header/
│   ├── header.component.ts
│   ├── header.component.html
│   └── header.component.scss
│
├── sidebar/
│   ├── sidebar.component.ts
│   ├── sidebar.component.html
│   └── sidebar.component.scss
│
├── footer/
│   ├── footer.component.ts
│   ├── footer.component.html
│   └── footer.component.scss
│
└── layout.component.ts            # Main Container
```

### Layout Component

```typescript
// core/layout/layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-header />

      <div class="main-wrapper">
        <app-sidebar />

        <main class="content">
          <router-outlet />
        </main>
      </div>

      <app-footer />
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .main-wrapper {
        display: flex;
        flex: 1;
      }

      .content {
        flex: 1;
        padding: 24px;
      }
    `,
  ],
})
export class LayoutComponent {}
```

### Angular Material Layout Alternative

```typescript
// core/layout/layout.component.ts (mit Material)
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="drawer.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Issue Tracker</span>
      <span class="spacer"></span>
      <button mat-icon-button>
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/projects">
            <mat-icon>folder</mat-icon>
            <span>Projects</span>
          </a>
          <a mat-list-item routerLink="/tickets">
            <mat-icon>assignment</mat-icon>
            <span>Tickets</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: calc(100vh - 64px);
      }

      .sidenav {
        width: 250px;
      }

      .content {
        padding: 24px;
      }

      .spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class LayoutComponent {}
```

---

## 🛣️ Routing-Strategie

### Root Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  // Public Routes (ohne Layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // Protected Routes (mit Layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(
            (m) => m.PROJECTS_ROUTES
          ),
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./features/tickets/tickets.routes').then(
            (m) => m.TICKETS_ROUTES
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
```

### Lazy Loading Vorteile

| Aspekt             | Eager Loading        | Lazy Loading ✅  |
| ------------------ | -------------------- | ---------------- |
| **Initial Bundle** | Groß (alle Features) | Klein (nur Core) |
| **Load Time**      | Langsam              | **Schnell**      |
| **Code Splitting** | Nein                 | **Ja**           |
| **Performance**    | Schlechter           | **Besser**       |
| **SEO**            | Gut                  | Gut (mit SSR)    |

---

## 🧠 Smart vs. Dumb Components

### Smart Components (Container)

**Eigenschaften:**

- In `/features` Ordnern
- Laden Daten von Services
- Verwalten State
- Enthalten Business-Logik

**Beispiel:**

```typescript
// features/projects/project-list/project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../services/projects.service';
import { Project } from '@issue-tracker/shared-types';
import { ProjectCardComponent } from '../../../shared/components/project-card/project-card.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  template: `
    <h1>Projects</h1>

    <div class="project-grid">
      <app-project-card
        *ngFor="let project of projects"
        [project]="project"
        (clicked)="openProject(project.id)"
      />
    </div>
  `,
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];

  constructor(private projectsService: ProjectsService) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectsService.getAll().subscribe({
      next: (projects) => (this.projects = projects),
      error: (err) => console.error('Failed to load projects', err),
    });
  }

  openProject(id: string) {
    // Navigation logic
  }
}
```

### Dumb Components (Presentational)

**Eigenschaften:**

- In `/shared` Ordner
- Nur `@Input()` und `@Output()`
- Keine Service-Dependencies
- Keine Business-Logik

**Beispiel:**

```typescript
// shared/components/project-card/project-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" (click)="clicked.emit()">
      <h3>{{ project.name }}</h3>
      <p>{{ project.description }}</p>
      <span class="badge">{{ project.status }}</span>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
      }
      .card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Output() clicked = new EventEmitter<void>();
}
```

---

## ✅ Best Practices

### 1. **Feature-Services im Feature halten**

```typescript
// ✅ RICHTIG
features / projects / services / projects.service.ts;

// ❌ FALSCH
core / services / projects.service.ts;
```

**Warum?**

- Besseres Lazy Loading
- Feature kann isoliert entwickelt werden
- Kleinere Bundle-Größen

---

### 2. **Shared Components wiederverwendbar halten**

```typescript
// ✅ RICHTIG: Generische Card Component
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
})
export class CardComponent {}

// ❌ FALSCH: Feature-spezifische Component in Shared
@Component({
  selector: 'app-project-card',
  // ...
})
export class ProjectCardComponent {
  constructor(private projectsService: ProjectsService) {} // ← Service Dependency!
}
```

---

### 3. **Barrel Exports für einfache Imports**

```typescript
// shared/components/index.ts
export * from './button/button.component';
export * from './card/card.component';
export * from './table/table.component';

// Verwendung
import { ButtonComponent, CardComponent } from '@app/shared/components';
```

---

### 4. **Path Mapping in tsconfig.base.json**

```json
{
  "compilerOptions": {
    "paths": {
      "@app/core/*": ["apps/frontend/src/app/core/*"],
      "@app/shared/*": ["apps/frontend/src/app/shared/*"],
      "@app/features/*": ["apps/frontend/src/app/features/*"]
    }
  }
}
```

**Verwendung:**

```typescript
// Vorher
import { AuthService } from '../../../core/services/auth.service';

// Nachher
import { AuthService } from '@app/core/services/auth.service';
```

---

### 5. **Naming Conventions**

| Typ             | Convention         | Beispiel                    |
| --------------- | ------------------ | --------------------------- |
| **Component**   | `*.component.ts`   | `project-list.component.ts` |
| **Service**     | `*.service.ts`     | `projects.service.ts`       |
| **Guard**       | `*.guard.ts`       | `auth.guard.ts`             |
| **Interceptor** | `*.interceptor.ts` | `jwt.interceptor.ts`        |
| **Pipe**        | `*.pipe.ts`        | `truncate.pipe.ts`          |
| **Directive**   | `*.directive.ts`   | `autofocus.directive.ts`    |
| **Model**       | `*.model.ts`       | `project.model.ts`          |
| **Routes**      | `*.routes.ts`      | `projects.routes.ts`        |

---

### 6. **Component-Ordner Struktur**

```
component-name/
├── component-name.component.ts       # Component Logic
├── component-name.component.html     # Template
├── component-name.component.scss     # Styles
└── component-name.component.spec.ts  # Tests
```

**Inline vs. Separate Files:**

- **Inline** (< 10 Zeilen): Template/Style im Component
- **Separate** (> 10 Zeilen): Eigene HTML/SCSS-Dateien

---

### 7. **Index Exports (Barrel Pattern)**

```typescript
// features/projects/index.ts
export * from './project-list/project-list.component';
export * from './project-detail/project-detail.component';
export * from './services/projects.service';
```

---

## 🔄 Migration Guide

### Schritt 1: Layout erstellen

```bash
# Layout Component generieren
npx nx g @nx/angular:component core/layout/layout --standalone

# Header Component
npx nx g @nx/angular:component core/layout/header --standalone

# Sidebar Component
npx nx g @nx/angular:component core/layout/sidebar --standalone
```

### Schritt 2: Features strukturieren

```bash
# Dashboard Feature
npx nx g @nx/angular:component features/dashboard/dashboard --standalone

# Projects Feature
npx nx g @nx/angular:component features/projects/project-list --standalone
npx nx g @nx/angular:component features/projects/project-detail --standalone
npx nx g @nx/angular:service features/projects/services/projects

# Tickets Feature
npx nx g @nx/angular:component features/tickets/ticket-list --standalone
npx nx g @nx/angular:component features/tickets/ticket-board --standalone
npx nx g @nx/angular:service features/tickets/services/tickets
```

### Schritt 3: Shared Components

```bash
# UI Components
npx nx g @nx/angular:component shared/components/button --standalone
npx nx g @nx/angular:component shared/components/card --standalone
npx nx g @nx/angular:component shared/components/dialog/confirm-dialog --standalone
```

### Schritt 4: Routes konfigurieren

```typescript
// features/projects/projects.routes.ts erstellen
// app.routes.ts aktualisieren mit Lazy Loading
```

---

## 📊 Vergleich: Alte vs. Moderne Struktur

| Aspekt             | Module-based (alt)        | Standalone (modern) ✅           |
| ------------------ | ------------------------- | -------------------------------- |
| **Organization**   | `*.module.ts` Files       | Feature-basierte Ordner          |
| **Imports**        | `NgModule` imports array  | Direkt in Component              |
| **Lazy Loading**   | `loadChildren` mit Module | `loadComponent` / `loadChildren` |
| **Code Splitting** | Module-Ebene              | Component-Ebene (feiner)         |
| **Boilerplate**    | Viel (NgModule)           | **Wenig** ✅                     |
| **Tree Shaking**   | Gut                       | **Besser** ✅                    |
| **Bundle Size**    | Größer                    | **Kleiner** ✅                   |

---

## 🎯 Zusammenfassung

### Für das Issue Tracker Projekt:

1. **`/core`** → Auth, Guards, Interceptors, Layout
2. **`/shared`** → Buttons, Cards, Dialogs, Form Components
3. **`/features`** → Dashboard, Projects, Tickets, Users
4. **Lazy Loading** für alle Features
5. **Standalone Components** überall
6. **Smart/Dumb Trennung** konsequent umsetzen

### Vorteile dieser Struktur:

✅ **Skalierbar** - Neue Features einfach hinzufügen  
✅ **Wartbar** - Klare Verantwortlichkeiten  
✅ **Performant** - Lazy Loading, Tree Shaking  
✅ **Modern** - Standalone Components, Signals-ready  
✅ **Testbar** - Klare Trennung, einfache Mocks  
✅ **Team-freundlich** - Entwickler arbeiten parallel an Features

---

## 📚 Weiterführende Ressourcen

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Nx Best Practices](https://nx.dev/concepts/more-concepts/applications-and-libraries)
- [Angular Architecture Patterns](https://angular.io/guide/architecture)
- [Standalone Components Guide](https://angular.io/guide/standalone-components)

---

**Erstellt am:** 17. November 2025  
**Projekt:** Issue Tracker - Angular Frontend  
**Version:** 1.0
