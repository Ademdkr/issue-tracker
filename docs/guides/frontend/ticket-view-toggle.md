# Ticket View Toggle Implementation - Grid-Ansicht Anleitung

Diese Anleitung beschreibt, wie du die Grid-Ansicht für die Ticket-Tabelle implementierst, um zwischen Listen- und Grid-Ansicht umschalten zu können.

## Übersicht

**Aktueller Stand:**

- ✅ List-Ansicht mit Material Table ist implementiert (ticket-list-view)
- ✅ Grid-Ansicht mit Material Cards ist implementiert (ticket-grid-view)
- ✅ Toggle-Buttons (Liste/Grid) sind vorhanden
- ✅ `viewMode` State wird zwischen Komponenten weitergegeben
- ✅ Container-Komponente (ticket-table) schaltet zwischen Views um
- ✅ Separate Komponenten für List und Grid View
- ✅ Responsive Grid-Layout (1-4 Spalten)

**Implementiert:**

- Separate Komponenten für bessere Wartbarkeit
- Conditional Rendering basierend auf viewMode
- Responsive Design mit Mobile-First Ansatz
- Beide Ansichten verwenden `TicketWithDetails` Typ

## Architektur

**Implementierte Struktur:**

```
ticket-table/
├── ticket-table.ts              # ✅ Container-Komponente mit viewMode Input
├── ticket-table.html            # ✅ Conditional rendering (@if viewMode === 'list'/'grid')
├── ticket-table.scss            # ✅ Minimal (nur .ticket-views wrapper)
└── components/
    ├── ticket-list-view/        # ✅ IMPLEMENTIERT: Material Table Ansicht
    │   ├── ticket-list-view.ts  # ViewChild für MatSort & MatPaginator
    │   ├── ticket-list-view.html # 7 Spalten (ohne Labels)
    │   └── ticket-list-view.scss # Table-spezifische Styles
    └── ticket-grid-view/        # ✅ IMPLEMENTIERT: Card Grid Ansicht
        ├── ticket-grid-view.ts   # Simpler als list-view (kein ViewChild)
        ├── ticket-grid-view.html # MatCard mit @for loop
        └── ticket-grid-view.scss # Responsive Grid (1-4 cols)
```

**Komponenten-Verantwortlichkeiten:**

- **ticket-table**: Orchestriert List/Grid Views, gibt `tickets` und `viewMode` weiter
- **ticket-list-view**: Standalone Komponente mit Material Table, Sorting, Pagination
- **ticket-grid-view**: Standalone Komponente mit Card-Grid, Responsive Layout

## Wichtige Hinweise zur Implementierung

### TicketWithDetails vs Ticket

**Verwendet:** `TicketWithDetails` (aus `@issue-tracker/shared-types`)

```typescript
export interface TicketWithDetails extends Ticket {
  reporter?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  // labels?: Label[]; // Auskommentiert - nicht implementiert
  commentCount?: number;
}
```

**Grund:** Das Backend liefert erweiterte Ticket-Objekte mit `assignee` und `reporter` als vollständige Objekte, nicht nur IDs.

### Labels Status

**Status:** ❌ Nicht implementiert

**Grund:** `TicketWithDetails` hat die `labels` Property auskommentiert. Das Backend liefert nur `labelIds` (Array von Strings), nicht die vollständigen Label-Objekte mit `name` und `color`.

**Lösung:** Labels-Spalte wurde aus beiden Views entfernt.

**Zukünftig:** Wenn Labels benötigt werden:

1. Backend muss Label-Objekte zurückgeben
2. `labels?: Label[]` in TicketWithDetails aktivieren
3. Labels-Spalte wieder hinzufügen

---

## Schritt 1: Template-Struktur (✅ IMPLEMENTIERT)

### ticket-table.html

Die Komponente wurde in separate Child-Komponenten aufgeteilt für bessere Wartbarkeit.

**Implementierte Struktur:**

```html
<div class="ticket-views">
  <!-- List View: Material Table -->
  @if (viewMode === 'list') {
  <app-ticket-list-view
    [tickets]="tickets"
    (ticketClick)="onTicketClick($event)"
  ></app-ticket-list-view>
  }

  <!-- Grid View: Card Grid -->
  @if (viewMode === 'grid') {
  <app-ticket-grid-view
    [tickets]="tickets"
    (ticketClick)="onTicketClick($event)"
  ></app-ticket-grid-view>
  }
</div>
```

**ticket-table.ts:**

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketWithDetails } from '@issue-tracker/shared-types';
import { TicketListView } from './components/ticket-list-view/ticket-list-view';
import { TicketGridView } from './components/ticket-grid-view/ticket-grid-view';

@Component({
  selector: 'app-ticket-table',
  standalone: true,
  imports: [CommonModule, TicketListView, TicketGridView],
  templateUrl: './ticket-table.html',
  styleUrl: './ticket-table.scss',
})
export class TicketTable {
  @Input() tickets: TicketWithDetails[] = [];
  @Input() viewMode: 'list' | 'grid' = 'list';
  @Output() ticketClick = new EventEmitter<TicketWithDetails>();

  onTicketClick(ticket: TicketWithDetails): void {
    this.ticketClick.emit(ticket);
  }
}
```

**Wichtig:** Verwendet `TicketWithDetails` statt `Ticket`, da das Backend erweiterte Daten mit `assignee` und `reporter` Objekten zurückgibt.

## Schritt 2: Card-Inhalt (✅ IMPLEMENTIERT)

### ticket-grid-view.html

**Implementierte Card-Struktur:**

```html
<div class="tickets-grid">
  @for (ticket of tickets; track ticket.id) {
  <mat-card class="ticket-card" (click)="onCardClick(ticket)">
    <!-- Header mit Titel, Status und ID -->
    <mat-card-header>
      <mat-card-title>
        <div class="title-row">
          <span class="ticket-id">#{{ ticket.id }}</span>
          <mat-chip [color]="getStatusColor(ticket.status)">
            {{ ticket.status }}
          </mat-chip>
        </div>
      </mat-card-title>
      <mat-card-subtitle>{{ ticket.title }}</mat-card-subtitle>
    </mat-card-header>

    <!-- Content -->
    <mat-card-content>
      <!-- Priorität -->
      <div class="card-field">
        <mat-icon class="field-icon">flag</mat-icon>
        <mat-chip [color]="getPriorityColor(ticket.priority)">
          {{ ticket.priority }}
        </mat-chip>
      </div>

      <!-- Assignee (verwendet assignee Objekt aus TicketWithDetails) -->
      <div class="card-field">
        <mat-icon class="field-icon">person</mat-icon>
        <span>{{ ticket.assignee?.name || 'Nicht zugewiesen' }}</span>
      </div>

      <!-- Timestamps -->
      <div class="card-timestamps">
        <div class="timestamp">
          <mat-icon>schedule</mat-icon>
          <span>{{ ticket.createdAt | date: 'short' }}</span>
        </div>
        @if (ticket.updatedAt) {
        <div class="timestamp">
          <mat-icon>update</mat-icon>
          <span>{{ ticket.updatedAt | date: 'short' }}</span>
        </div>
        }
      </div>
    </mat-card-content>
  </mat-card>
  }
</div>

<!-- Empty State -->
@if (tickets.length === 0) {
<div class="empty-state">
  <mat-icon>inbox</mat-icon>
  <h3>Keine Tickets vorhanden</h3>
  <p>Es wurden keine Tickets gefunden.</p>
</div>
}
```

**Wichtige Änderungen:**

- ❌ **Labels entfernt**: `TicketWithDetails` hat nur `labelIds` (Array von IDs), nicht die vollständigen Label-Objekte. Die Label-Anzeige wurde aus beiden Views entfernt.
- ✅ **assignee Objekt**: Verwendet `ticket.assignee?.name` statt `ticket.assigneeId`, da `TicketWithDetails` das erweiterte Objekt enthält.
- ✅ **Empty State**: Zeigt Message wenn keine Tickets vorhanden sind.

## Schritt 3: Imports (✅ IMPLEMENTIERT)

### ticket-list-view.ts

```typescript
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TicketWithDetails } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-list-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
  ],
  // ...
})
export class TicketListView implements OnChanges, AfterViewInit {
  @Input() tickets: TicketWithDetails[] = [];
  @Output() ticketClick = new EventEmitter<TicketWithDetails>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<TicketWithDetails>([]);
  displayedColumns: string[] = [
    'title',
    'status',
    'priority',
    'assignee',
    'reporterId',
    'createdAt',
    'updatedAt',
  ]; // Labels entfernt
}
```

### ticket-grid-view.ts

```typescript
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TicketWithDetails } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-grid-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  // ...
})
export class TicketGridView {
  @Input() tickets: TicketWithDetails[] = [];
  @Output() ticketClick = new EventEmitter<TicketWithDetails>();
  // Kein ViewChild notwendig (einfacher als list-view)
}
```

## Schritt 4: SCSS Styling (✅ IMPLEMENTIERT)

### ticket-table.scss

Container-Styles (minimal, da Logik in Child-Komponenten):

```scss
.ticket-views {
  width: 100%;
}
```

### ticket-grid-view.scss

**Implementierte Styles:**

```scss
// Responsive Grid Layout
.tickets-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1rem 0;

  // Mobile: 1 Spalte (< 768px)
  grid-template-columns: 1fr;

  // Tablet: 2 Spalten (768px+)
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop: 3 Spalten (1200px+)
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // Large Desktop: 4 Spalten (1600px+)
  @media (min-width: 1600px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Ticket Card Styles
.ticket-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  mat-card-header {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 0.5rem;

      .ticket-id {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--md-sys-color-primary);
      }
    }

    mat-card-title {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    mat-card-subtitle {
      font-size: 0.875rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2; // Standard-Eigenschaft für Kompatibilität
      -webkit-box-orient: vertical;
      line-height: 1.4;
      max-height: 2.8em;
    }
  }

  mat-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;
    flex: 1;

    .card-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;

      .field-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--md-sys-color-on-surface-variant);
      }

      &.labels-field {
        align-items: flex-start;

        .labels-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          flex: 1;
        }
      }

      mat-chip {
        font-size: 0.75rem;
        min-height: 24px;
      }
    }

    .card-timestamps {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid var(--md-sys-color-outline-variant);

      .timestamp {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--md-sys-color-on-surface-variant);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        .timestamp-label {
          font-weight: 500;
        }
      }
    }
  }
}

// Chip Colors (falls noch nicht vorhanden)
mat-chip {
  &[color='primary'] {
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }

  &[color='accent'] {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }

  &[color='warn'] {
    background-color: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
  }
}
```

## Schritt 5: Paginator (✅ IMPLEMENTIERT)

### Separate Paginatoren in Child-Komponenten

Da List und Grid separate Komponenten sind, hat jede ihren eigenen Paginator:

**ticket-list-view.html:**

```html
<mat-paginator
  [pageSizeOptions]="[10, 25, 50, 100]"
  [pageSize]="25"
  showFirstLastButtons
></mat-paginator>
```

**ticket-grid-view.html:**

```html
<!-- Aktuell: Kein Paginator in Grid-View implementiert -->
<!-- Optional: Kann später hinzugefügt werden mit angepassten Optionen -->
```

**ticket-list-view.ts - Lifecycle:**

```typescript
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

ngAfterViewInit(): void {
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}
```

**Hinweis:** Grid-View kann optional einen Paginator mit angepassten Settings (z.B. [12, 24, 48]) hinzufügen.

## Schritt 6: Datenanbindung (✅ IMPLEMENTIERT)

### Input/Output Pattern

**Implementierte Datenfluss:**

```
tickets-tab (Container)
    ↓ [tickets]="filteredTickets" [viewMode]="viewMode"
ticket-table (Orchestrator)
    ↓ [tickets]="tickets" (ticketClick)="onTicketClick($event)"
ticket-list-view / ticket-grid-view (Presentation)
```

**Vorteile:**

1. **Einfache Datenbindung**: Tickets werden als Input weitergegeben
2. **Keine Paginator-Konflikte**: Jede View verwaltet ihre eigene Pagination (oder keine)
3. **Filtering**: Wird im Parent (tickets-tab) gehandhabt, gefilterte Daten werden durchgereicht

**Grid-View Implementierung:**

- Verwendet `@Input() tickets` direkt
- Keine `dataSource` notwendig (einfacher als List-View)
- Rendering über `@for (ticket of tickets; track ticket.id)`

**Optional: Sorting-Dropdown für Grid-Ansicht**

```html
@if (viewMode === 'grid') {
<div class="grid-controls">
  <mat-form-field appearance="outline" class="sort-field">
    <mat-label>Sortieren nach</mat-label>
    <mat-select
      [(value)]="currentSort"
      (selectionChange)="onSortChange($event)"
    >
      <mat-option value="title-asc">Titel (A-Z)</mat-option>
      <mat-option value="title-desc">Titel (Z-A)</mat-option>
      <mat-option value="createdAt-desc">Neueste zuerst</mat-option>
      <mat-option value="createdAt-asc">Älteste zuerst</mat-option>
      <mat-option value="priority-desc">Priorität (Hoch-Niedrig)</mat-option>
      <mat-option value="priority-asc">Priorität (Niedrig-Hoch)</mat-option>
    </mat-select>
  </mat-form-field>
</div>

<div class="tickets-grid">
  <!-- Cards -->
</div>
}
```

```typescript
currentSort = 'createdAt-desc';

onSortChange(event: any): void {
  const [field, direction] = event.value.split('-');

  if (this.sort) {
    this.sort.active = field;
    this.sort.direction = direction as 'asc' | 'desc';
    this.sort.sortChange.emit();
  }
}
```

## Schritt 7: Performance-Optimierung (✅ IMPLEMENTIERT)

### TrackBy für Grid

**Implementiert:**

```html
@for (ticket of tickets; track ticket.id) {
<mat-card class="ticket-card">...</mat-card>
}
```

Zusätzliche `trackByTicketId` Methode in beiden Views:

```typescript
trackByTicketId(index: number, ticket: TicketWithDetails): string {
  return ticket.id;
}
```

### Virtual Scrolling (Optional für große Listen)

Wenn du sehr viele Tickets hast (100+), kannst du Virtual Scrolling hinzufügen:

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

// In imports array:
imports: [
  // ...
  ScrollingModule,
];
```

```html
<cdk-virtual-scroll-viewport itemSize="280" class="grid-viewport">
  <div class="tickets-grid">
    @for (ticket of dataSource.data; track ticket.id) {
    <mat-card class="ticket-card">
      <!-- ... -->
    </mat-card>
    }
  </div>
</cdk-virtual-scroll-viewport>
```

## Schritt 8: Accessibility

Stelle sicher, dass beide Ansichten barrierefrei sind:

```html
<!-- List View -->
<table mat-table role="table" aria-label="Tickets Tabelle">
  <!-- ... -->
</table>

<!-- Grid View -->
<div class="tickets-grid" role="list" aria-label="Tickets Grid">
  <mat-card role="listitem" [attr.aria-label]="'Ticket ' + ticket.title">
    <!-- ... -->
  </mat-card>
</div>
```

## Schritt 9: Testing

### Funktionale Tests

1. **Umschaltung**: Toggle zwischen List und Grid funktioniert
2. **Daten-Konsistenz**: Beide Ansichten zeigen dieselben Daten
3. **Pagination**: Funktioniert in beiden Ansichten
4. **Sorting**: Funktioniert in List-Ansicht (und optional in Grid)
5. **Click-Events**: `onRowClick` funktioniert in beiden Ansichten
6. **Responsive**: Grid passt sich an verschiedene Bildschirmgrößen an

### Edge Cases

- Leere Ticket-Liste (zeige "Keine Tickets" Message)
- Einzelnes Ticket
- Sehr lange Ticket-Titel
- Viele Labels an einem Ticket

## Schritt 10: Empty State (✅ IMPLEMENTIERT in Grid-View)

**ticket-grid-view.html:**

```html
<div class="tickets-grid">
  @for (ticket of tickets; track ticket.id) {
  <!-- Cards -->
  }
</div>

<!-- Empty State -->
@if (tickets.length === 0) {
<div class="empty-state">
  <mat-icon>inbox</mat-icon>
  <h3>Keine Tickets vorhanden</h3>
  <p>Es wurden keine Tickets gefunden.</p>
</div>
}
```

**ticket-grid-view.scss:**

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  // Nimmt volle Grid-Breite ein
  grid-column: 1 / -1;

  mat-icon {
    font-size: 64px;
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
  }
}
```

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);

  mat-icon {
    font-size: 64px;
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
}
```

## Zusammenfassung - Implementierungsstatus

### ✅ Implementiert

1. ✅ **Separate Komponenten**: ticket-list-view & ticket-grid-view erstellt
2. ✅ **Container Pattern**: ticket-table orchestriert zwischen Views
3. ✅ **Conditional Rendering**: `@if (viewMode === 'list'/'grid')` in ticket-table.html
4. ✅ **Card-Struktur**: MatCard mit Header, Content, Timestamps
5. ✅ **Responsive Grid**: CSS Grid mit 1-4 Spalten (768px, 1200px, 1600px Breakpoints)
6. ✅ **Material Modules**: Alle notwendigen Module importiert
7. ✅ **TicketWithDetails Typ**: Verwendet erweiterten Typ mit assignee/reporter Objekten
8. ✅ **TrackBy**: Performance-Optimierung mit `track ticket.id`
9. ✅ **Empty State**: In Grid-View implementiert
10. ✅ **Paginator**: In List-View (25 Items per page)

### ❌ Nicht Implementiert / Angepasst

- ❌ **Labels**: Entfernt aus beiden Views (TicketWithDetails hat nur labelIds, keine Label-Objekte)
- ❌ **Paginator in Grid**: Aktuell kein Paginator in Grid-View
- ⚡ **Sorting in Grid**: Optional - kann mit Dropdown hinzugefügt werden
- ⚡ **Virtual Scrolling**: Optional für große Datenmengen
- ⚡ **Accessibility**: Kann weiter verbessert werden (aria-labels)

### 📊 Aktuelle Spalten (List-View)

7 Spalten (ohne Labels):

1. title
2. status
3. priority
4. assignee (verwendet `ticket.assignee?.name`)
5. reporterId
6. createdAt
7. updatedAt

## Tipps

- **Mobile First**: Grid-Ansicht sollte auf Mobile auch gut aussehen (1 Spalte)
- **Konsistenz**: Farben und Icons sollten zwischen List und Grid konsistent sein
- **Performance**: Bei vielen Tickets (>100) Virtual Scrolling in Betracht ziehen
- **UX**: User-Preference für View-Mode im LocalStorage speichern (Optional)

## Nächste Schritte

Nach erfolgreicher Implementierung kannst du weitere Features hinzufügen:

- Drag & Drop für Status-Änderung in Grid-Ansicht
- Quick-Actions (Edit, Delete) direkt auf der Card
- Hover-Preview mit mehr Details
- Animations beim Wechsel zwischen Ansichten
