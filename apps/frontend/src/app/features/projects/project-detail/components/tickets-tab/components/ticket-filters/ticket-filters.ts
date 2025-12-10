import { Component, Output, EventEmitter } from '@angular/core';
import { TicketFilters as TicketFiltersType } from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-filters',
  imports: [],
  templateUrl: './ticket-filters.html',
  styleUrl: './ticket-filters.scss',
})
export class TicketFilters {
  @Output() filtersChange = new EventEmitter<TicketFiltersType>();
}
