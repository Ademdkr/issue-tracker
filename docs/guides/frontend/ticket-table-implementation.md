# Ticket-Tabellen Implementierung - Anleitung

Diese Anleitung beschreibt die Implementierung der Ticket-Tabelle in der Projekt-Detailansicht (`/projects/:id`).

## Übersicht

Die Ticket-Tabelle besteht aus mehreren Komponenten:

```
tickets-tab/
├── tickets-tab.ts/html/scss           # Container-Komponente
└── components/
    ├── ticket-filters/                # Filter-Dropdowns + Suche
    ├── ticket-table/                  # Material Table mit Sorting/Pagination
    └── ticket-view-toggle/            # Listen-/Grid-Ansicht Toggle
```

## 1. TicketsService erstellen

Der Service verwaltet die Kommunikation mit dem Backend für Tickets.

### Service-Struktur

```typescript
// apps/frontend/src/app/core/services/tickets.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket, TicketFilters } from '@issue-tracker/shared-types';

// Hinweis: Ticket und TicketFilters werden aus @issue-tracker/shared-types importiert
// Diese Types sind in libs/shared-types definiert und werden von Frontend und Backend geteilt

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  findAllByProject(
    projectId: string,
    filters?: TicketFilters
  ): Observable<Ticket[]> {
    let params = new HttpParams().set('projectId', projectId);

    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.priority) {
        params = params.set('priority', filters.priority);
      }
      if (filters.assigneeId) {
        params = params.set('assigneeId', filters.assigneeId);
      }
      // TODO: Backend unterstützt aktuell nur einzelne labelId, nicht mehrere
      // if (filters.labelIds && filters.labelIds.length > 0) {
      //   params = params.set('labelId', filters.labelIds[0]);
      // }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }
    return this.http.get<Ticket[]>(this.apiUrl, { params });
  }
}
```

## 2. TicketsTab Container implementieren

Die Container-Komponente verwaltet den State und koordiniert die Child-Komponenten.

### TypeScript

```typescript
// tickets-tab.ts

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TicketsService } from '../../../../../core/services/tickets.service';
import {
  Ticket,
  TicketFilters as TicketFiltersType,
} from '@issue-tracker/shared-types';
import { TicketFilters as TicketFiltersComponent } from './components/ticket-filters/ticket-filters';
import { TicketViewToggle } from './components/ticket-view-toggle/ticket-view-toggle';
import { TicketTable } from './components/ticket-table/ticket-table';

@Component({
  selector: 'app-tickets-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule, // Für Error-State Button
    TicketFiltersComponent,
    TicketViewToggle,
    TicketTable,
  ],
  templateUrl: './tickets-tab.html',
  styleUrl: './tickets-tab.scss',
})
export class TicketsTab implements OnInit, OnDestroy {
  @Input() projectId!: string;

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  isLoading = false;
  error: string | null = null;

  currentFilters: TicketFiltersType = {};
  viewMode: 'list' | 'grid' = 'list';

  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<TicketFiltersType>();

  constructor(private ticketsService: TicketsService) {
    // Debounce filter changes
    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((filters) => {
        this.currentFilters = filters;
        this.loadTickets();
      });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTickets(): void {
    if (!this.projectId) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.ticketsService
      .findAllByProject(this.projectId, this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.filteredTickets = tickets;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Fehler beim Laden der Tickets.';
          console.error('Error loading tickets:', err);
          this.isLoading = false;
        },
      });
  }

  onFiltersChange(filters: TicketFiltersType): void {
    this.filterSubject$.next(filters);
  }

  onViewModeChange(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  onTicketClick(ticket: Ticket): void {
    // Navigation zu Ticket-Detail
    // Router-Navigation hier implementieren
    console.log('Navigate to ticket:', ticket.id);
  }
}
```

**Wichtig - Namenskonflikt:**
Das `TicketFilters` Interface aus shared-types wird als `TicketFiltersType` importiert, um einen Namenskonflikt mit der `TicketFilters` Component zu vermeiden.

### HTML

```html
<!-- tickets-tab.html -->

<div class="tickets-tab-container">
  <!-- Filter-Section -->
  <div class="filters-section">
    <app-ticket-filters
      (filtersChange)="onFiltersChange($event)"
    ></app-ticket-filters>

    <app-ticket-view-toggle
      [viewMode]="viewMode"
      (viewModeChange)="onViewModeChange($event)"
    ></app-ticket-view-toggle>
  </div>

  <!-- Loading State -->
  @if (isLoading) {
  <div class="loading-container">
    <mat-spinner diameter="50"></mat-spinner>
    <p>Tickets werden geladen...</p>
  </div>
  }

  <!-- Error State -->
  @if (error && !isLoading) {
  <div class="error-container">
    <p class="error-message">{{error}}</p>
    <button mat-raised-button color="primary" (click)="loadTickets()">
      Erneut versuchen
    </button>
  </div>
  }

  <!-- Tickets Table -->
  @if (!isLoading && !error) {
  <div class="table-container">
    <app-ticket-table
      [tickets]="filteredTickets"
      [viewMode]="viewMode"
      (ticketClick)="onTicketClick($event)"
    ></app-ticket-table>
  </div>
  }
</div>
```

**Hinweis:** Angular 18 verwendet die moderne `@if` Control Flow Syntax anstelle von `*ngIf`.

### SCSS

```scss
// tickets-tab.scss

.tickets-tab-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;

  p {
    margin-top: 1rem;
    color: var(--md-sys-color-on-surface-variant);
  }
}

.error-message {
  color: var(--md-sys-color-error);
  margin-bottom: 1rem;
}

.table-container {
  background-color: var(--md-sys-color-surface);
  border-radius: 12px;
  overflow: hidden;
}
```

## 3. TicketFilters Component

Diese Komponente enthält die Filter-Dropdowns und das Suchfeld.

### TypeScript

```typescript
// ticket-filters.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime } from 'rxjs/operators';
import { TicketFilters as TicketFiltersType } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './ticket-filters.html',
  styleUrl: './ticket-filters.scss',
})
export class TicketFilters {
  @Output() filtersChange = new EventEmitter<TicketFiltersType>();

  filterForm = new FormGroup({
    status: new FormControl(''),
    priority: new FormControl(''),
    assigneeId: new FormControl(''),
    labelIds: new FormControl<string[]>([]),
    search: new FormControl(''),
  });

  statusOptions = [
    { value: '', label: 'Alle Status' },
    { value: 'OPEN', label: 'Offen' },
    { value: 'IN_PROGRESS', label: 'In Bearbeitung' },
    { value: 'RESOLVED', label: 'Gelöst' },
    { value: 'CLOSED', label: 'Geschlossen' },
  ];

  priorityOptions = [
    { value: '', label: 'Alle Prioritäten' },
    { value: 'LOW', label: 'Niedrig' },
    { value: 'MEDIUM', label: 'Mittel' },
    { value: 'HIGH', label: 'Hoch' },
    { value: 'CRITICAL', label: 'Kritisch' },
  ];

  // TODO: Assignees und Labels dynamisch vom Backend laden
  assigneeOptions = [{ value: '', label: 'Alle Zuständigen' }];

  labelOptions: { value: string; label: string }[] = [];

  constructor() {
    // Emit filters on any change
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.emitFilters());
  }

  emitFilters(): void {
    const formValue = this.filterForm.value;

    const filters: TicketFiltersType = {
      status: formValue.status || undefined,
      priority: formValue.priority || undefined,
      assigneeId: formValue.assigneeId || undefined,
      labelIds:
        formValue.labelIds && formValue.labelIds.length > 0
          ? formValue.labelIds
          : undefined,
      search: formValue.search || undefined,
    };

    // Nur Felder mit Werten senden
    const cleanedFilters: TicketFiltersType = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedFilters[key as keyof TicketFiltersType] = value;
      }
    });

    this.filtersChange.emit(cleanedFilters);
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      priority: '',
      assigneeId: '',
      labelIds: [],
      search: '',
    });
  }
}
```

### HTML

```html
<!-- ticket-filters.html -->

<form [formGroup]="filterForm" class="filters-form">
  <!-- Suche -->
  <mat-form-field appearance="outline" class="search-field">
    <mat-label>Tickets durchsuchen</mat-label>
    <input
      matInput
      formControlName="search"
      placeholder="Titel oder Beschreibung..."
    />
    <mat-icon matPrefix>search</mat-icon>
  </mat-form-field>

  <!-- Status Filter -->
  <mat-form-field appearance="outline">
    <mat-label>Status</mat-label>
    <mat-select formControlName="status">
      <mat-option *ngFor="let option of statusOptions" [value]="option.value">
        {{ option.label }}
      </mat-option>
    </mat-select>
  </mat-form-field>

  <!-- Priority Filter -->
  <mat-form-field appearance="outline">
    <mat-label>Priorität</mat-label>
    <mat-select formControlName="priority">
      <mat-option *ngFor="let option of priorityOptions" [value]="option.value">
        {{ option.label }}
      </mat-option>
    </mat-select>
  </mat-form-field>

  <!-- Assignee Filter -->
  <mat-form-field appearance="outline">
    <mat-label>Zuständig</mat-label>
    <mat-select formControlName="assigneeId">
      <mat-option *ngFor="let option of assigneeOptions" [value]="option.value">
        {{ option.label }}
      </mat-option>
    </mat-select>
  </mat-form-field>

  <!-- Labels Filter (Multi-Select) -->
  <mat-form-field appearance="outline">
    <mat-label>Labels</mat-label>
    <mat-select formControlName="labelIds" multiple>
      <mat-option *ngFor="let option of labelOptions" [value]="option.value">
        {{ option.label }}
      </mat-option>
    </mat-select>
  </mat-form-field>

  <!-- Reset Button -->
  <button
    mat-button
    type="button"
    (click)="resetFilters()"
    class="reset-button"
  >
    <mat-icon>clear</mat-icon>
    Filter zurücksetzen
  </button>
</form>
```

### SCSS

```scss
// ticket-filters.scss

.filters-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;

  mat-form-field {
    min-width: 200px;
    flex: 1;

    &.search-field {
      min-width: 300px;
      flex: 2;
    }
  }

  .reset-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
```

## 4. TicketTable Component

Material Table mit Sorting und Pagination.

### TypeScript

```typescript
// ticket-table.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Ticket } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './ticket-table.html',
  styleUrl: './ticket-table.scss',
})
export class TicketTable implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() viewMode: 'list' | 'grid' = 'list';
  @Output() ticketClick = new EventEmitter<Ticket>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<Ticket>([]);
  displayedColumns: string[] = [
    'title',
    'status',
    'priority',
    'assignee',
    'labels',
    'reporterId',
    'createdAt',
    'updatedAt',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets']) {
      this.dataSource.data = this.tickets;

      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }

  // WICHTIG: Häufiger Fehler - Stelle sicher, dass der Property-Name
  // in changes['tickets'] mit dem @Input() Namen übereinstimmt!

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onRowClick(ticket: Ticket): void {
    this.ticketClick.emit(ticket);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      OPEN: 'primary',
      IN_PROGRESS: 'accent',
      RESOLVED: 'success',
      CLOSED: 'default',
    };
    return colors[status] || 'default';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      LOW: 'default',
      MEDIUM: 'primary',
      HIGH: 'warn',
      CRITICAL: 'error',
    };
    return colors[priority] || 'default';
  }

  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }
}
```

### HTML

```html
<!-- ticket-table.html -->

<div class="table-wrapper">
  <table mat-table [dataSource]="dataSource" matSort class="tickets-table">
    <!-- Title Column -->
    <ng-container matColumnDef="title">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Titel</th>
      <td mat-cell *matCellDef="let ticket" (click)="onRowClick(ticket)">
        <div class="ticket-title">
          <strong>{{ ticket.title }}</strong>
          <span class="ticket-id">#{{ ticket.id }}</span>
        </div>
      </td>
    </ng-container>

    <!-- Status Column -->
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
      <td mat-cell *matCellDef="let ticket">
        <mat-chip [color]="getStatusColor(ticket.status)">
          {{ ticket.status }}
        </mat-chip>
      </td>
    </ng-container>

    <!-- Priority Column -->
    <ng-container matColumnDef="priority">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Priorität</th>
      <td mat-cell *matCellDef="let ticket">
        <mat-chip [color]="getPriorityColor(ticket.priority)">
          {{ ticket.priority }}
        </mat-chip>
      </td>
    </ng-container>

    <!-- Assignee Column -->
    <ng-container matColumnDef="assignee">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Zuständig</th>
      <td mat-cell *matCellDef="let ticket">
        {{ ticket.assignee?.name || 'Nicht zugewiesen' }}
      </td>
    </ng-container>

    <!-- Labels Column -->
    <ng-container matColumnDef="labels">
      <th mat-header-cell *matHeaderCellDef>Labels</th>
      <td mat-cell *matCellDef="let ticket">
        <div class="labels-container">
          <mat-chip
            *ngFor="let label of ticket.labels"
            [style.background-color]="label.color"
          >
            {{ label.name }}
          </mat-chip>
        </div>
      </td>
    </ng-container>

    <!-- Updated At Column -->
    <ng-container matColumnDef="updatedAt">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Aktualisiert</th>
      <td mat-cell *matCellDef="let ticket">
        {{ ticket.updatedAt | date:'short' }}
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr
      mat-row
      *matRowDef="let row; columns: displayedColumns;"
      class="ticket-row"
      (click)="onRowClick(row)"
    ></tr>
  </table>

  <!-- Paginator -->
  <mat-paginator
    [pageSizeOptions]="[10, 25, 50, 100]"
    [pageSize]="25"
    showFirstLastButtons
  ></mat-paginator>
</div>
```

### SCSS

```scss
// ticket-table.scss

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.tickets-table {
  width: 100%;

  .ticket-row {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--md-sys-color-surface-variant);
    }
  }

  .ticket-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    strong {
      color: var(--md-sys-color-on-surface);
    }

    .ticket-id {
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface-variant);
    }
  }

  .labels-container {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  mat-chip {
    font-size: 0.75rem;
    min-height: 24px;
  }
}

mat-paginator {
  background-color: transparent;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}
```

## 5. TicketViewToggle Component

Einfacher Toggle zwischen Listen- und Grid-Ansicht.

### TypeScript

```typescript
// ticket-view-toggle.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ticket-view-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './ticket-view-toggle.html',
  styleUrls: ['./ticket-view-toggle.scss'],
})
export class TicketViewToggleComponent {
  @Input() viewMode: 'list' | 'grid' = 'list';
  @Output() viewModeChange = new EventEmitter<'list' | 'grid'>();

  onViewModeChange(mode: 'list' | 'grid'): void {
    this.viewModeChange.emit(mode);
  }
}
```

### HTML

```html
<!-- ticket-view-toggle.html -->

<mat-button-toggle-group
  [value]="viewMode"
  (change)="onViewModeChange($event.value)"
  aria-label="Ansichtsmodus"
>
  <mat-button-toggle value="list">
    <mat-icon>view_list</mat-icon>
    Liste
  </mat-button-toggle>
  <mat-button-toggle value="grid">
    <mat-icon>view_module</mat-icon>
    Grid
  </mat-button-toggle>
</mat-button-toggle-group>
```

### SCSS

```scss
// ticket-view-toggle.scss

mat-button-toggle-group {
  box-shadow: none;
  border: 1px solid var(--md-sys-color-outline);
}
```

## 6. Integration in ProjectDetail

Füge die TicketsTab-Komponente in `project-detail.ts` ein:

```typescript
// project-detail.ts

import { TicketsTab } from './components/tickets-tab/tickets-tab';

@Component({
  // ...
  imports: [
    // ... andere Imports
    TicketsTab,
  ],
})
export class ProjectDetail {
  // ...
}
```

Aktualisiere das Template:

```html
<!-- project-detail.html -->

<mat-tab label="Tickets">
  <div class="tab-content">
    <app-tickets-tab [projectId]="project.id"></app-tickets-tab>
  </div>
</mat-tab>
```

## 7. Backend-Anforderungen

Stelle sicher, dass das Backend folgende Endpunkte unterstützt:

### GET /api/tickets

Query-Parameter:

- `projectId` (required): Projekt-ID
- `status` (optional): Filter nach Status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `priority` (optional): Filter nach Priorität (LOW, MEDIUM, HIGH, CRITICAL)
- `assigneeId` (optional): Filter nach Zuständigem
- `labelId` (optional): Filter nach einzelner Label-ID (**Hinweis:** Backend unterstützt aktuell nur einzelne labelId, nicht mehrere)
- `search` (optional): Volltextsuche in Titel/Beschreibung

Beispiel:

```
GET /api/tickets?projectId=123&status=OPEN&priority=HIGH&search=bug
```

**Wichtig:** Das Backend verwendet rollenbasierte Filterung:

- **Manager/Admin:** Alle Tickets sichtbar
- **Reporter:** Nur selbst erstellte Tickets
- **Developer:** Selbst erstellte + Tickets aus Projekten mit Mitgliedschaft

## 8. Testing-Checkliste

- [ ] Tickets werden korrekt geladen
- [ ] Filter funktionieren (Status, Priority, Assignee, Labels)
- [ ] Suche funktioniert mit Debouncing
- [ ] Sortierung funktioniert für alle Spalten
- [ ] Pagination funktioniert korrekt
- [ ] Klick auf Ticket-Zeile navigiert zur Detail-Seite
- [ ] Loading-State wird angezeigt
- [ ] Error-State wird angezeigt bei Fehler
- [ ] View-Toggle funktioniert (wenn Grid-View implementiert)
- [ ] Filter-Reset funktioniert
- [ ] Responsive Design auf mobilen Geräten

## 9. Nächste Schritte

Nach Implementierung der Ticket-Tabelle:

1. **Grid-View implementieren**: Alternative Card-basierte Ansicht für Tickets
2. **Ticket-Detail-Seite**: Route `/tickets/:id` mit vollständigen Details
3. **Ticket-Formular**: Modal/Seite zum Erstellen/Bearbeiten von Tickets
4. **Management-Tab**: Komponenten für Member- und Label-Management
5. **Real-Time Updates**: WebSocket-Integration für Live-Updates

## Hilfreiche Patterns aus bestehendem Code

- **Loading/Error States**: Siehe `projects.ts` für konsistente Implementierung
- **Filter-Architektur**: Siehe `project-filters.ts` für Dropdown-Patterns
- **Service-Integration**: Siehe `projects.service.ts` für HTTP-Patterns
- **Table-Styling**: Siehe `projects-table.scss` für Material-Table-Styling
- **RxJS Cleanup**: Siehe `project-detail.ts` für Subject mit takeUntil
