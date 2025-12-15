import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { TicketsService } from '../../../core/services/tickets.service';

// Types
import { TicketWithDetails } from '@issue-tracker/shared-types';

// Components
import { TicketOverviewTab } from './components/ticket-overview-tab/ticket-overview-tab';
import { TicketCommentsTab } from './components/ticket-comments-tab/ticket-comments-tab';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TicketOverviewTab,
    TicketCommentsTab,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketsService = inject(TicketsService);

  ticket: TicketWithDetails | null = null;
  projectId: string | null = null;
  ticketId: string | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    // Get IDs from route
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.ticketId = this.route.snapshot.paramMap.get('ticketId');

    if (this.projectId && this.ticketId) {
      this.loadTicket();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTicket(): void {
    if (!this.projectId || !this.ticketId) return;

    this.isLoading = true;
    this.error = null;

    this.ticketsService
      .findOne(this.projectId, this.ticketId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.error = 'Fehler beim Laden des Tickets.';
          console.error('Error loading ticket:', err);
          this.isLoading = false;
        },
      });
  }

  onTicketUpdated(updatedTicket: TicketWithDetails): void {
    this.ticket = updatedTicket;
  }

  onTicketDeleted(): void {
    // Navigate back to project tickets
    if (this.projectId) {
      this.router.navigate(['/projects', this.projectId], {
        queryParams: { tab: 'tickets' },
      });
    }
  }

  goBack(): void {
    if (this.projectId) {
      this.router.navigate(['/projects', this.projectId], {
        queryParams: { tab: 'tickets' },
      });
    } else {
      this.router.navigate(['/projects']);
    }
  }
}
