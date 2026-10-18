import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TicketWithDetails } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-grid-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './ticket-grid-view.html',
  styleUrl: './ticket-grid-view.scss',
})
export class TicketGridView {
  @Input() tickets: TicketWithDetails[] = [];
  @Input() showProjectColumn = false;
  @Output() ticketClick = new EventEmitter<TicketWithDetails>();

  onCardClick(ticket: TicketWithDetails): void {
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
