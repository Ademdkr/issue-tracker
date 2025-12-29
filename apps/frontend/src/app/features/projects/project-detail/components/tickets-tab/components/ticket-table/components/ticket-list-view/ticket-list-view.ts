import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TicketWithDetails } from '@issue-tracker/shared-types';
import { Ticket } from '@issue-tracker/shared-types';

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
  templateUrl: './ticket-list-view.html',
  styleUrl: './ticket-list-view.scss',
})
export class TicketListView implements OnInit, OnChanges, AfterViewInit {
  @Input() tickets: TicketWithDetails[] = [];
  @Input() showProjectColumn = false;
  @Output() ticketClick = new EventEmitter<TicketWithDetails>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<TableTicket>([]);
  displayedColumns: string[] = [];

  private readonly FIXED_ROW_COUNT = 10;

  ngOnInit(): void {
    this.updateDisplayedColumns();
    const paddedTickets = this.padTicketsToFixedCount(this.tickets);
    this.dataSource.data = paddedTickets;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showProjectColumn']) {
      this.updateDisplayedColumns();
    }

    if (changes['tickets']) {
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

  private updateDisplayedColumns(): void {
    const baseColumns = [
      'title',
      'status',
      'priority',
      'assignee',
      'reporterId',
      'createdAt',
      'updatedAt',
    ];

    if (this.showProjectColumn) {
      this.displayedColumns = ['project', ...baseColumns];
    } else {
      this.displayedColumns = baseColumns;
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

  onRowClick(ticket: TableTicket): void {
    // Ignoriere Klicks auf leere Zeilen
    if (this.isEmptyRow(ticket)) {
      return;
    }
    this.ticketClick.emit(ticket as TicketWithDetails);
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      OPEN: 'Offen',
      IN_PROGRESS: 'In Bearbeitung',
      RESOLVED: 'Gelöst',
      CLOSED: 'Abgeschlossen',
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      LOW: 'Niedrig',
      MEDIUM: 'Mittel',
      HIGH: 'Hoch',
      CRITICAL: 'Kritisch',
    };
    return labels[priority] || priority;
  }

  trackByTicketId(index: number, ticket: TicketWithDetails): string {
    return ticket.id;
  }
}
