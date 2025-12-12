# List-View: Feste Anzahl von 10 Zeilen - Implementierungsanleitung

## Ziel

Die Ticket-Tabelle soll immer genau 10 Zeilen anzeigen. Wenn weniger als 10 Tickets vorhanden sind, werden die fehlenden Zeilen mit Platzhaltern ("-") gefüllt.

## Übersicht der Ansätze

Es gibt mehrere Möglichkeiten, dies zu implementieren:

1. **Dummy-Daten Ansatz** (Empfohlen): Füge leere Ticket-Objekte hinzu, um auf 10 aufzufüllen
2. **CSS-Ansatz**: Nutze CSS Grid/Flexbox für feste Höhe (komplexer mit Material Table)
3. **Custom Row Renderer**: Rendere zusätzliche leere Zeilen im Template

**Empfehlung:** Ansatz 1 (Dummy-Daten) ist am einfachsten und funktioniert gut mit Material Table.

---

## Ansatz 1: Dummy-Daten (Empfohlen)

### Konzept

1. Erstelle eine Methode, die das `tickets` Array auf mindestens 10 Elemente auffüllt
2. Leere Zeilen bekommen ein spezielles Flag (z.B. `isEmpty: true`)
3. Im Template werden leere Zeilen anders dargestellt (alle Felder zeigen "-")
4. Click-Events werden für leere Zeilen deaktiviert

### Schritt 1: Type erweitern

Erstelle einen erweiterten Typ für die Tabellen-Daten:

**ticket-list-view.ts:**

```typescript
// Am Anfang der Datei, nach den Imports
type TableTicket = TicketWithDetails | EmptyTicketRow;

interface EmptyTicketRow {
  id: string;
  isEmpty: true;
  // Alle anderen Properties sind optional/undefined
  projectId?: string;
  reporterId?: string;
  assigneeId?: string;
  title?: string;
  description?: string;
  status?: any;
  priority?: any;
  createdAt?: Date;
  updatedAt?: Date | null;
  labelIds?: string[];
}
```

### Schritt 2: DataSource mit aufgefüllten Daten

**ticket-list-view.ts:**

```typescript
export class TicketListView implements OnChanges, AfterViewInit {
  @Input() tickets: TicketWithDetails[] = [];
  @Output() ticketClick = new EventEmitter<TicketWithDetails>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Typ ändern zu TableTicket
  dataSource = new MatTableDataSource<TableTicket>([]);
  
  displayedColumns: string[] = [
    'title',
    'status',
    'priority',
    'assignee',
    'reporterId',
    'createdAt',
    'updatedAt',
  ];

  private readonly FIXED_ROW_COUNT = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets']) {
      // Fülle Array auf 10 Elemente auf
      const paddedTickets = this.padTicketsToFixedCount(this.tickets);
      this.dataSource.data = paddedTickets;

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

  /**
   * Füllt das Tickets-Array auf mindestens FIXED_ROW_COUNT Elemente auf
   */
  private padTicketsToFixedCount(tickets: TicketWithDetails[]): TableTicket[] {
    const currentCount = tickets.length;
    
    // Wenn bereits genug Tickets vorhanden sind, gib sie unverändert zurück
    if (currentCount >= this.FIXED_ROW_COUNT) {
      return tickets;
    }

    // Berechne wie viele leere Zeilen benötigt werden
    const emptyRowsNeeded = this.FIXED_ROW_COUNT - currentCount;
    
    // Erstelle leere Zeilen
    const emptyRows: EmptyTicketRow[] = Array.from(
      { length: emptyRowsNeeded },
      (_, index) => ({
        id: `empty-${index}`,
        isEmpty: true,
      })
    );

    // Kombiniere echte Tickets mit leeren Zeilen
    return [...tickets, ...emptyRows];
  }

  /**
   * Prüft ob eine Zeile leer ist
   */
  isEmptyRow(ticket: TableTicket): boolean {
    return 'isEmpty' in ticket && ticket.isEmpty === true;
  }

  /**
   * Click-Handler - ignoriert leere Zeilen
   */
  onRowClick(ticket: TableTicket): void {
    if (this.isEmptyRow(ticket)) {
      return; // Keine Aktion für leere Zeilen
    }
    this.ticketClick.emit(ticket as TicketWithDetails);
  }

  // Bestehende Methoden bleiben unverändert
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

  trackByTicketId(index: number, ticket: TableTicket): string {
    return ticket.id;
  }
}
```

### Schritt 3: Template anpassen

**ticket-list-view.html:**

Jede Spalte muss nun prüfen, ob es sich um eine leere Zeile handelt:

```html
<div class="table-wrapper">
  <table class="tickets-table" mat-table [dataSource]="dataSource" matSort>
    <!-- Title Column -->
    <ng-container matColumnDef="title">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Titel</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          <div class="ticket-title">
            <strong>{{ticket.title}}</strong>
            <span class="ticket-id">#{{ticket.id}}</span>
          </div>
        }
      </td>
    </ng-container>

    <!-- Status Column -->
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          <mat-chip [color]="getStatusColor(ticket.status)">
            {{ticket.status}}
          </mat-chip>
        }
      </td>
    </ng-container>

    <!-- Priority Column -->
    <ng-container matColumnDef="priority">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Priorität</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          <mat-chip [color]="getPriorityColor(ticket.priority)">
            {{ticket.priority}}
          </mat-chip>
        }
      </td>
    </ng-container>

    <!-- Assignee Column -->
    <ng-container matColumnDef="assignee">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Zuständig</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          {{ticket.assignee?.name || '-'}}
        }
      </td>
    </ng-container>

    <!-- Created By Column -->
    <ng-container matColumnDef="reporterId">
      <th mat-header-cell *matHeaderCellDef>Erstellt von</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          {{ticket.reporterId.name }} {{ticket.reporterId.surname}}
        }
      </td>
    </ng-container>

    <!-- Created At Column -->
    <ng-container matColumnDef="createdAt">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Erstellt am</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          {{ ticket.createdAt | date: 'short' }}
        }
      </td>
    </ng-container>

    <!-- Updated At Column -->
    <ng-container matColumnDef="updatedAt">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Aktualisiert am</th>
      <td mat-cell *matCellDef="let ticket">
        @if (isEmptyRow(ticket)) {
          <span class="empty-cell">-</span>
        } @else {
          {{ ticket.updatedAt | date: 'short'}}
        }
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr
      mat-row
      *matRowDef="let row; columns: displayedColumns;"
      [class.ticket-row]="!isEmptyRow(row)"
      [class.empty-row]="isEmptyRow(row)"
      (click)="onRowClick(row)"
    ></tr>
  </table>

  <mat-paginator
    [pageSizeOptions]="[10, 25, 50, 100]"
    [pageSize]="25"
    showFirstLastButtons
  ></mat-paginator>
</div>
```

### Schritt 4: Styling für leere Zeilen

**ticket-list-view.scss:**

```scss
// Bestehende Styles...

.tickets-table {
  width: 100%;

  .ticket-row {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--md-sys-color-surface-variant);
    }
  }

  // Leere Zeilen - kein Hover, kein Cursor
  .empty-row {
    cursor: default;
    opacity: 0.5; // Optional: mache leere Zeilen transparenter

    &:hover {
      background-color: transparent; // Kein Hover-Effekt
    }
  }

  .empty-cell {
    color: var(--md-sys-color-on-surface-variant);
    font-style: italic;
    text-align: center;
    display: block;
  }

  // Restliche Styles...
}
```

---

## Ansatz 2: Pagination mit festen 10 Zeilen pro Seite

Wenn du Pagination verwendest und immer 10 Zeilen pro Seite zeigen willst:

### Option A: Paginator auf 10 fixieren

**ticket-list-view.html:**

```html
<mat-paginator
  [pageSizeOptions]="[10]"
  [pageSize]="10"
  showFirstLastButtons
></mat-paginator>
```

**ticket-list-view.ts:**

```typescript
ngAfterViewInit(): void {
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
  
  // Stelle sicher, dass Paginator immer 10 zeigt
  if (this.paginator) {
    this.paginator.pageSize = 10;
  }
}
```

### Option B: Kombiniere feste Seitengröße mit Padding

```typescript
private padTicketsToFixedCount(tickets: TicketWithDetails[]): TableTicket[] {
  // Hole aktuelle Seite vom Paginator
  const pageIndex = this.paginator?.pageIndex || 0;
  const pageSize = 10;
  
  // Berechne Start und Ende für aktuelle Seite
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  
  // Hole Tickets für aktuelle Seite
  const pageTickets = tickets.slice(startIndex, endIndex);
  
  // Fülle auf 10 auf, wenn weniger vorhanden
  if (pageTickets.length < pageSize) {
    const emptyRowsNeeded = pageSize - pageTickets.length;
    const emptyRows: EmptyTicketRow[] = Array.from(
      { length: emptyRowsNeeded },
      (_, index) => ({
        id: `empty-${pageIndex}-${index}`,
        isEmpty: true,
      })
    );
    return [...pageTickets, ...emptyRows];
  }
  
  return pageTickets;
}
```

---

## Ansatz 3: Sorting-Überlegungen

### Problem

Wenn leere Zeilen im DataSource sind, werden sie beim Sorting mitberücksichtigt.

### Lösung 1: Custom Sort

Filtere leere Zeilen vor dem Sorting:

```typescript
ngAfterViewInit(): void {
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
  
  // Custom Sort: Sortiere nur echte Tickets
  this.dataSource.sortData = (data: TableTicket[], sort: MatSort) => {
    const realTickets = data.filter(t => !this.isEmptyRow(t));
    const emptyRows = data.filter(t => this.isEmptyRow(t));
    
    // Sortiere nur echte Tickets
    const sorted = this.defaultSortData(realTickets, sort);
    
    // Füge leere Zeilen am Ende hinzu
    return [...sorted, ...emptyRows];
  };
}

// Default Material Sort Logik
private defaultSortData(data: TableTicket[], sort: MatSort): TableTicket[] {
  if (!sort.active || sort.direction === '') {
    return data;
  }

  return data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'title':
        return this.compare(a.title || '', b.title || '', isAsc);
      case 'status':
        return this.compare(a.status || '', b.status || '', isAsc);
      case 'priority':
        return this.compare(a.priority || '', b.priority || '', isAsc);
      case 'createdAt':
        return this.compare(
          a.createdAt?.getTime() || 0,
          b.createdAt?.getTime() || 0,
          isAsc
        );
      case 'updatedAt':
        return this.compare(
          a.updatedAt?.getTime() || 0,
          b.updatedAt?.getTime() || 0,
          isAsc
        );
      default:
        return 0;
    }
  });
}

private compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
```

### Lösung 2: Sortiere nur erste Seite

Wenn du Pagination hast, sortiere nur innerhalb der aktuellen Seite:

```typescript
// Deaktiviere Sorting, wenn Pagination aktiv ist
ngAfterViewInit(): void {
  // Nur Paginator, kein Sort
  this.dataSource.paginator = this.paginator;
  
  // Sort manuell handhaben
  if (this.sort) {
    this.sort.sortChange.subscribe(() => {
      this.applyCustomSort();
    });
  }
}
```

---

## Ansatz 4: Alternative ohne Dummy-Daten

### Konzept

Verwende CSS, um die Tabelle auf eine feste Höhe zu setzen, die 10 Zeilen entspricht.

### Implementierung

**ticket-list-view.scss:**

```scss
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  
  // Feste Höhe für genau 10 Zeilen + Header + Paginator
  min-height: calc(
    56px +           // Header row
    (48px * 10) +    // 10 data rows (Standard Material Table row height)
    56px             // Paginator
  );
}

.tickets-table {
  width: 100%;
  
  // Verhindere, dass Tabelle kleiner wird
  min-height: calc(56px + (48px * 10));
}
```

**Nachteil:** Zeigt nur leeren Raum, keine Platzhalter "-".

---

## Performance-Überlegungen

### Ansatz 1 (Dummy-Daten)

**Vorteile:**
- ✅ Einfach zu implementieren
- ✅ Volle Kontrolle über Platzhalter-Anzeige
- ✅ Funktioniert gut mit Material Table

**Nachteile:**
- ⚠️ DataSource enthält "fake" Daten
- ⚠️ Sorting muss angepasst werden
- ⚠️ Filter müssen leere Zeilen berücksichtigen

### Ansatz 4 (CSS)

**Vorteile:**
- ✅ Keine Änderung an Daten notwendig
- ✅ Sorting funktioniert normal

**Nachteile:**
- ❌ Keine Platzhalter "-" möglich
- ❌ Zeigt nur leeren Raum

---

## Testing Checklist

Nach der Implementierung teste folgende Szenarien:

- [ ] **0 Tickets**: Zeigt 10 leere Zeilen mit "-"
- [ ] **5 Tickets**: Zeigt 5 echte + 5 leere Zeilen
- [ ] **10 Tickets**: Zeigt 10 echte Zeilen, keine leeren
- [ ] **15 Tickets**: Zeigt 15 echte Zeilen (mehr als 10 ist ok)
- [ ] **Click auf leere Zeile**: Keine Aktion
- [ ] **Click auf echte Zeile**: Event wird emittiert
- [ ] **Hover über leere Zeile**: Kein Hover-Effekt
- [ ] **Hover über echte Zeile**: Hover-Effekt funktioniert
- [ ] **Sorting**: Leere Zeilen bleiben unten
- [ ] **Pagination**: Bei 10 Items pro Seite + Padding funktioniert korrekt

---

## Empfohlene Implementierungsreihenfolge

1. **Schritt 1:** Typ `TableTicket` und `EmptyTicketRow` definieren
2. **Schritt 2:** `padTicketsToFixedCount()` Methode implementieren
3. **Schritt 3:** `isEmptyRow()` Methode implementieren
4. **Schritt 4:** `ngOnChanges` anpassen, um Padding zu nutzen
5. **Schritt 5:** `onRowClick` anpassen, um leere Zeilen zu ignorieren
6. **Schritt 6:** Template aktualisieren - eine Spalte nach der anderen
7. **Schritt 7:** SCSS für `.empty-row` und `.empty-cell` hinzufügen
8. **Schritt 8:** Testen mit verschiedenen Ticket-Anzahlen
9. **Schritt 9:** Optional: Custom Sorting implementieren
10. **Schritt 10:** Optional: Pagination-Logik anpassen

---

## Fazit

**Empfehlung:** Implementiere **Ansatz 1 (Dummy-Daten)** für die beste Balance zwischen Funktionalität und Komplexität.

Die Implementierung erfordert:
- ~50 Zeilen TypeScript-Code
- Anpassungen in jeder Spalte des Templates
- Minimale SCSS-Anpassungen
- Optional: Custom Sorting Logic

**Geschätzte Implementierungszeit:** 30-45 Minuten
