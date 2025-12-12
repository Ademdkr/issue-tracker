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
import { TicketWithDetails } from '@issue-tracker/shared-types';
import { Ticket } from '@issue-tracker/shared-types';

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
export class TicketListView implements OnChanges {
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

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onRowClick(ticket: TicketWithDetails): void {
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

  trackByTicketId(index: number, ticket: TicketWithDetails): string {
    return ticket.id;
  }
}
