import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TicketsService } from '../../../core/services/tickets.service';
import { ProjectsService } from '../../../core/services/projects.service';
import {
  TicketWithDetails,
  TicketFilters as TicketFiltersType,
  ProjectSummary,
} from '@issue-tracker/shared-types';
import { TicketFilters as TicketFiltersComponent } from '../../projects/project-detail/components/tickets-tab/components/ticket-filters/ticket-filters';
import { TicketTable } from '../../projects/project-detail/components/tickets-tab/components/ticket-table/ticket-table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-tickets-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatInputModule,
    TicketFiltersComponent,
    TicketTable,
  ],
  templateUrl: './tickets-overview.html',
  styleUrls: ['./tickets-overview.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsOverview implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private ticketsService = inject(TicketsService);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tickets: TicketWithDetails[] = [];
  filteredTickets: TicketWithDetails[] = [];
  projects: ProjectSummary[] = [];
  isLoading = false;
  error: string | null = null;
  viewMode: 'list' | 'grid' = 'list';

  selectedProjectId = '';
  currentFilters: TicketFiltersType = {
    status: undefined,
    priority: undefined,
    assigneeId: undefined,
    labelIds: undefined,
    search: undefined,
  };

  ngOnInit(): void {
    this.loadProjects();
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.projectsService
      .findAllByRole()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects: ProjectSummary[]) => {
          this.projects = projects;
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          console.error('Error loading projects:', err);
          this.cdr.markForCheck();
        },
      });
  }

  loadTickets(): void {
    this.isLoading = true;
    this.error = null;

    const filters = {
      ...this.currentFilters,
      projectId: this.selectedProjectId || undefined,
    };

    this.ticketsService
      .findAll(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.filteredTickets = tickets;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Fehler beim Laden der Tickets.';
          console.error('Error loading tickets:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onProjectChange(projectId: string | null): void {
    this.selectedProjectId = projectId || '';
    this.loadTickets();
  }

  onFiltersChange(filters: TicketFiltersType): void {
    this.currentFilters = { ...filters };
    this.loadTickets();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentFilters.search = input.value || undefined;
    this.loadTickets();
  }

  onViewModeChange(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  onTicketClick(ticket: TicketWithDetails): void {
    if (ticket.project) {
      this.router.navigate([
        '/projects',
        ticket.project.id,
        'tickets',
        ticket.id,
      ]);
    }
  }
}
