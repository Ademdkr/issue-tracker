import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { TicketsService } from '../../../../../core/services/tickets.service';
import {
  TicketWithDetails,
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
    MatButtonModule,
    TicketFiltersComponent,
    TicketViewToggle,
    TicketTable,
  ],
  templateUrl: './tickets-tab.html',
  styleUrl: './tickets-tab.scss',
})
export class TicketsTab implements OnInit, OnDestroy {
  @Input() projectId!: string;

  tickets: TicketWithDetails[] = [];
  filteredTickets: TicketWithDetails[] = [];
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

  onSearchChange(search: string): void {
    // Füge Suche zu den aktuellen Filtern hinzu
    const updatedFilters = { ...this.currentFilters, search };
    this.filterSubject$.next(updatedFilters);
  }

  onViewModeChange(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  onTicketClick(ticket: TicketWithDetails): void {
    // Navigation zu Ticket-Detail
    // Router-Navigation hier implementieren
    console.log('Navigate to ticket:', ticket.id);
  }
}
