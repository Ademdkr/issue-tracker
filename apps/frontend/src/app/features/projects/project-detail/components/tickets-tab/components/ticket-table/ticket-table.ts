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
