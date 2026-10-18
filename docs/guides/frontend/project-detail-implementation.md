# Project Detail View - Implementierungs-Anleitung

## 📋 Übersicht

Diese Anleitung zeigt Schritt-für-Schritt, wie die `/projects/:id` Detail-Ansicht mit Tabs implementiert wird. Die Implementierung orientiert sich an der bestehenden `/projects`-Struktur und übernimmt bewährte Patterns.

---

## 📊 Analyse der bestehenden `/projects`-Struktur

### **Was bereits vorhanden ist:**

✅ **Routes sind konfiguriert:**

- `/projects` → Projects-Liste
- `/projects/:id` → ProjectDetail-Component (bereits in `app.routes.ts` eingetragen)

✅ **Navigation ist implementiert:**

- "Details"-Buttons in `projects.html` verwenden `[routerLink]="['/projects', project.id]"`

✅ **Strukturelle Patterns:**

- **Standalone Components** mit direkten Imports
- **Material Design Components** (MatCard, MatButton, MatFormField, etc.)
- **State Management** mit RxJS Subjects
- **Service-basierte Datenverwaltung** (ProjectsService)
- **Loading/Error States** mit conditionals (`*ngIf`)
- **Filter-System** mit Buttons und aktiven States
- **Search-Funktionalität** mit Debouncing

---

## 🎯 Implementierungs-Schritte

### **Phase 1: Basis-Setup (ProjectDetail Container)**

#### **Schritt 1: Component generieren**

```bash
npx nx g @nx/angular:component features/projects/project-detail --standalone --skip-tests --style=scss
```

Dies erstellt:

```
apps/frontend/src/app/features/projects/project-detail/
├── project-detail.ts
├── project-detail.html
└── project-detail.scss
```

---

#### **Schritt 2: TypeScript-Struktur implementieren**

**Datei:** `project-detail.ts`

**Benötigte Imports:**

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Components
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Types
import { ProjectsService } from '../../../core/services/projects.service';
import { Project } from '@issue-tracker/shared-types';
```

**Component-Deklaration:**

```typescript
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail implements OnInit, OnDestroy {
  // State Management (analog zu projects.ts)
  project: Project | null = null;
  isLoading = false;
  error: string | null = null;

  // RxJS für Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute, // ← Für :id Parameter
    private projectsService: ProjectsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // 1. Route-Parameter auslesen
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.loadProject(projectId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Analog zu loadProjects() in projects.ts
  loadProject(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.projectsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.project = project;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Fehler beim Laden des Projekts:', error);
          this.error = 'Projekt konnte nicht geladen werden.';
          this.isLoading = false;

          this.snackBar.open('Fehler beim Laden des Projekts', 'Schließen', {
            duration: 3000,
          });
        },
      });
  }
}
```

---

#### **Schritt 3: Template-Struktur erstellen**

**Datei:** `project-detail.html`

**Struktur analog zu `projects.html`:**

```html
<div class="project-detail-container">
  <!-- Loading State (wie bei projects.html) -->
  <div *ngIf="isLoading" class="loading-container">
    <mat-spinner></mat-spinner>
    <p>Projekt wird geladen...</p>
  </div>

  <!-- Error State (wie bei projects.html) -->
  <div *ngIf="!isLoading && error" class="error-container">
    <mat-icon class="error-icon">error_outline</mat-icon>
    <h3>{{ error }}</h3>
    <button
      mat-raised-button
      color="primary"
      (click)="loadProject(project?.id || '')"
    >
      <mat-icon>refresh</mat-icon>
      Erneut versuchen
    </button>
  </div>

  <!-- Content (nur wenn geladen) -->
  <div *ngIf="!isLoading && !error && project" class="project-content">
    <!-- Header Section -->
    <div class="project-header">
      <div class="header-info">
        <h1>Projekt: {{ project.name }}</h1>
        <p>{{ project.description }}</p>
      </div>
      <button mat-raised-button color="primary">
        <mat-icon>add</mat-icon>
        Neues Ticket erstellen
      </button>
    </div>

    <!-- Tabs Navigation -->
    <mat-tab-group animationDuration="300ms">
      <!-- Tab 1: Tickets -->
      <mat-tab label="Tickets">
        <div class="tab-content">
          <!-- Hier später: <app-tickets-tab [projectId]="project.id" /> -->
          <p>Tickets-Tab Placeholder</p>
          <p class="placeholder-info">
            Hier werden alle Tickets des Projekts angezeigt mit Filtern für
            Status, Priorität, Assignee und Labels.
          </p>
        </div>
      </mat-tab>

      <!-- Tab 2: Verwaltung -->
      <mat-tab label="Verwaltung">
        <div class="tab-content">
          <!-- Hier später: <app-management-tab [projectId]="project.id" /> -->
          <p>Verwaltungs-Tab Placeholder</p>
          <p class="placeholder-info">
            Hier können Projektmitglieder und Labels verwaltet werden.
          </p>
        </div>
      </mat-tab>
    </mat-tab-group>
  </div>
</div>
```

---

#### **Schritt 4: Styling implementieren**

**Datei:** `project-detail.scss`

**Strukturiere das Styling wie bei `projects.scss`:**

```scss
.project-detail-container {
  padding: 24px;
  height: 100%;
}

// Loading/Error States (kopiere von projects.scss)
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;

  mat-spinner {
    margin-bottom: 16px;
  }

  .error-icon {
    font-size: 64px;
    width: 64px;
    height: 64px;
    color: #f44336;
  }

  h3 {
    color: rgba(0, 0, 0, 0.87);
    margin: 0;
  }

  button {
    margin-top: 8px;
  }
}

// Project Header
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  .header-info {
    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 16px;
    }
  }

  button {
    min-width: 200px;
  }
}

// Tab Styling
.tab-content {
  padding: 24px;
  min-height: 400px;

  .placeholder-info {
    color: rgba(0, 0, 0, 0.6);
    font-size: 14px;
    margin-top: 8px;
  }
}

// Material Tab Overrides (optional)
::ng-deep {
  .mat-mdc-tab-labels {
    padding: 0 24px;
  }

  .mat-mdc-tab {
    min-width: 120px;
  }
}
```

---

#### **Schritt 5: ProjectsService erweitern**

**Datei:** `apps/frontend/src/app/core/services/projects.service.ts`

**Prüfen, ob `findOne(id)` existiert. Falls nicht, hinzufügen:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Project, ProjectSummary } from '@issue-tracker/shared-types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private projectCreatedSubject = new Subject<void>();
  public projectCreated$ = this.projectCreatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Bestehende Methoden...
  findAllByRole(search?: string): Observable<ProjectSummary[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ProjectSummary[]>(this.apiUrl, { params });
  }

  // NEU: Einzelnes Projekt laden (falls noch nicht vorhanden)
  findOne(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(data: { name: string; description: string }): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data);
  }

  update(
    id: string,
    data: Partial<ProjectSummary>
  ): Observable<ProjectSummary> {
    return this.http.patch<ProjectSummary>(`${this.apiUrl}/${id}`, data);
  }

  adminUpdate(
    id: string,
    data: Partial<ProjectSummary>
  ): Observable<ProjectSummary> {
    return this.http.patch<ProjectSummary>(`${this.apiUrl}/${id}/admin`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  notifyProjectCreated(): void {
    this.projectCreatedSubject.next();
  }
}
```

---

#### **Schritt 6: Backend-Endpoint prüfen**

**Stelle sicher, dass der Backend-Endpoint existiert:**

**Datei:** `apps/backend/src/app/projects/projects.controller.ts`

```typescript
@Get(':id')
@UseGuards(ProjectAccessGuard)
async findOne(
  @Param('id') id: string,
  @CurrentUser() user: User
): Promise<Project> {
  return await this.projectsService.findOne(id);
}
```

Falls der Endpoint fehlt, muss er im Backend implementiert werden.

---

### **Phase 2: Testen der Basis-Implementierung**

#### **Schritt 7: Server starten und testen**

```bash
# Terminal 1: Backend starten
npx nx serve backend

# Terminal 2: Frontend starten
npx nx serve frontend
```

**Test-Schritte:**

1. ✅ Navigiere zu `http://localhost:4200/projects`
2. ✅ Klicke auf "Details" bei einem Projekt
3. ✅ Du wirst zu `/projects/{id}` navigiert
4. ✅ Loading-Spinner erscheint
5. ✅ Projekt-Daten werden geladen
6. ✅ Header mit Projekt-Name wird angezeigt
7. ✅ Zwei Tabs "Tickets" und "Verwaltung" sind sichtbar
8. ✅ Tab-Wechsel funktioniert

---

### **Phase 3: Tab-Components implementieren (später)**

#### **Schritt 8: Tickets-Tab erstellen**

```bash
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab --standalone --skip-tests --style=scss
```

**Input-Property hinzufügen:**

```typescript
@Input() projectId!: string;
```

**In project-detail.html einbinden:**

```html
<mat-tab label="Tickets">
  <app-tickets-tab [projectId]="project.id" />
</mat-tab>
```

---

#### **Schritt 9: Management-Tab erstellen**

```bash
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab --standalone --skip-tests --style=scss
```

**Input-Property hinzufügen:**

```typescript
@Input() projectId!: string;
```

**In project-detail.html einbinden:**

```html
<mat-tab label="Verwaltung">
  <app-management-tab [projectId]="project.id" />
</mat-tab>
```

---

#### **Schritt 10: Sub-Components für Tabs**

**Für Tickets-Tab:**

```bash
# Filter-Component
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab/components/ticket-filters --standalone --skip-tests --style=scss

# Tabelle
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab/components/ticket-table --standalone --skip-tests --style=scss

# View-Toggle
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab/components/ticket-view-toggle --standalone --skip-tests --style=scss
```

**Für Management-Tab:**

```bash
# Members Management
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab/components/members-management --standalone --skip-tests --style=scss

# Labels Management
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab/components/labels-management --standalone --skip-tests --style=scss
```

---

## 🎯 Key Patterns aus `/projects` übernehmen

| Pattern                   | Verwendung in Projects    | Anwendung in ProjectDetail        |
| ------------------------- | ------------------------- | --------------------------------- |
| **Loading State**         | `isLoading + *ngIf`       | Beim Laden des Projekts           |
| **Error Handling**        | `error + snackBar`        | Bei API-Fehlern                   |
| **RxJS Subjects**         | `destroy$` + `takeUntil`  | Subscription Cleanup              |
| **Material Components**   | MatCard, MatButton        | MatTabs, MatButton, MatIcon       |
| **Service Integration**   | `ProjectsService`         | `findOne(id)` verwenden           |
| **Conditional Rendering** | `*ngIf` für States        | Content nur bei geladenem Projekt |
| **Debouncing**            | Search mit `debounceTime` | Später für Ticket-Filter          |
| **TrackBy**               | `trackByProjectId`        | Später für Ticket-Listen          |

---

## 📊 Datenfluss-Übersicht

```
Browser URL: /projects/:id
      ↓
  ActivatedRoute (params)
      ↓
ProjectDetail.loadProject(id)
      ↓
ProjectsService.findOne(id)
      ↓
  Backend API: GET /api/projects/:id
      ↓
  Project-Daten
      ↓
  Template Rendering
      ↓
  ┌─────────────────────┐
  │   Project Header    │
  │  + Neues Ticket BTN │
  └─────────────────────┘
      ↓
  ┌─────────────────────┐
  │     MatTabGroup     │
  ├─────────────────────┤
  │ Tab 1: Tickets      │
  │  ├─ Filters         │
  │  ├─ View Toggle     │
  │  └─ Ticket Table    │
  ├─────────────────────┤
  │ Tab 2: Verwaltung   │
  │  ├─ Members Mgmt    │
  │  └─ Labels Mgmt     │
  └─────────────────────┘
```

---

## 💡 Wichtige Hinweise

### **1. Type-Unterschiede beachten**

- **`ProjectSummary`**: Für Listen-Ansicht (`/projects`)

  - Enthält: `ticketCount`, `memberCount`, `ticketsByStatus`
  - Optimiert für Übersichten

- **`Project`**: Für Detail-Ansicht (`/projects/:id`)
  - Enthält vollständige Projekt-Daten
  - Wird von `findOne(id)` zurückgegeben

### **2. Navigation aus Projects-Liste**

Die Navigation ist bereits implementiert in `projects.html`:

```html
<button mat-button [routerLink]="['/projects', project.id]">Details</button>
```

### **3. Lazy Loading**

Alle Routen verwenden bereits Lazy Loading:

```typescript
loadComponent: () =>
  import('./features/projects/project-detail/project-detail').then(
    (m) => m.ProjectDetail
  );
```

### **4. Tab-Content erst bei Bedarf laden**

Material Tabs laden Content standardmäßig lazy. Nutze `@defer` für weitere Optimierung:

```html
<mat-tab label="Tickets">
  @defer (on viewport) {
  <app-tickets-tab [projectId]="project.id" />
  } @loading {
  <mat-spinner />
  }
</mat-tab>
```

### **5. Responsive Design**

Orientiere dich am Styling von `/projects`:

- Mobile: Tabs vertikal stapeln
- Desktop: Tabs horizontal
- Nutze Material Design Breakpoints

---

## ✅ Checkliste

### **Phase 1: Basis (Minimal funktionsfähig)**

- [ ] ProjectDetail-Component erstellt
- [ ] TypeScript mit Route-Parameter-Handling implementiert
- [ ] Template mit Loading/Error States erstellt
- [ ] Basic Styling angewendet
- [ ] `ProjectsService.findOne(id)` implementiert
- [ ] Backend-Endpoint existiert
- [ ] Navigation von `/projects` funktioniert
- [ ] Zwei Tab-Placeholders sichtbar

### **Phase 2: Tab-Structure**

- [ ] TicketsTab-Component erstellt
- [ ] ManagementTab-Component erstellt
- [ ] Components in ProjectDetail eingebunden
- [ ] Input-Properties (`projectId`) übergeben

### **Phase 3: Tab-Features**

- [ ] Ticket-Filter implementiert
- [ ] Ticket-Tabelle implementiert
- [ ] Members-Management implementiert
- [ ] Labels-Management implementiert

---

## 🔗 Verwandte Dokumente

- [`PROJECT_DETAIL_STRUCTURE.md`](project-detail-structure.md) - Vollständige Verzeichnisstruktur
- [`SETUP_ANLEITUNG.md`](../../setup/nx/SETUP_ANLEITUNG.md) - Projekt-Setup
- [`AGENTS.md`](../../project/agents.md) - Nx-Konfiguration

---

## 🚀 Nächste Schritte nach Basis-Implementierung

1. **"Neues Ticket erstellen" Button funktional machen**

   - Modal/Dialog für Ticket-Erstellung
   - Integration mit TicketsService

2. **Tickets-Tab mit echten Daten füllen**

   - TicketsService.findAllByProject(projectId)
   - Filter-Funktionalität
   - Tabelle mit Pagination

3. **Management-Tab funktional machen**

   - ProjectMembersService erstellen
   - Members hinzufügen/entfernen
   - Labels CRUD-Operations

4. **Breadcrumb-Navigation hinzufügen**

   - "Projekte > Projekt-Name"
   - Zurück-Button zur Projekt-Liste

5. **Permissions/Guards prüfen**
   - Nur Projekt-Mitglieder dürfen zugreifen
   - Admins/Manager sehen alle Projekte

---

**Erstellt am:** 9. Dezember 2025  
**Branch:** `feature/projects-detail-view-integration`  
**Status:** ✅ Basis-Anleitung komplett
