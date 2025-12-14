import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TicketsService } from '../../../../../core/services/tickets.service';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { TicketDialogService } from '../../../../../core/services/ticket-dialog.service';
import {
  TicketWithDetails,
  TicketFilters as TicketFiltersType,
  Project,
} from '@issue-tracker/shared-types';
import { TicketFilters as TicketFiltersComponent } from './components/ticket-filters/ticket-filters';
import { TicketViewToggle } from './components/ticket-view-toggle/ticket-view-toggle';
import { TicketTable } from './components/ticket-table/ticket-table';
import { CreateTicketDialog } from './components/create-ticket-dialog/create-ticket-dialog';

@Component({
  selector: 'app-tickets-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
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

  project: Project | null = null;

  currentFilters: TicketFiltersType = {};
  viewMode: 'list' | 'grid' = 'list';

  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<TicketFiltersType>();

  private ticketsService = inject(TicketsService);
  private projectsService = inject(ProjectsService);
  private ticketDialogService = inject(TicketDialogService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  constructor() {
    // Debounce filter changes
    this.filterSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((filters) => {
        this.currentFilters = filters;
        this.loadTickets();
      });
  }

  ngOnInit(): void {
    this.loadProject();
    this.loadTickets();

    // Listen to create ticket dialog events from layout
    this.ticketDialogService.openCreateTicketDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.openCreateTicketDialog();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProject(): void {
    if (!this.projectId) return;

    this.projectsService
      .findOne(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project: Project) => {
          this.project = project;
        },
        error: (err: Error) => {
          console.error('Error loading project:', err);
        },
      });
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
    this.router.navigate(['/projects', this.projectId, 'tickets', ticket.id]);
  }

  openCreateTicketDialog(): void {
    const dialogRef = this.dialog.open(CreateTicketDialog, {
      width: '600px',
      data: {
        projectId: this.projectId,
        projectName: this.project?.name || '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Ticket wurde erstellt, Liste neu laden
        this.loadTickets();
      }
    });
  }
}
