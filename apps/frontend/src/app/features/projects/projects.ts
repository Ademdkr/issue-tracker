// apps/frontend/src/app/features/projects/projects.ts
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
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  ProjectSummary,
  ProjectStatus,
  UserRole,
} from '@issue-tracker/shared-types';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectSettingsService } from '../../core/services/project-settings.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDivider,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects implements OnInit, OnDestroy {
  private readonly projectsService = inject(ProjectsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly projectSettingsService = inject(ProjectSettingsService);
  private readonly cdr = inject(ChangeDetectorRef);

  projects: ProjectSummary[] = [];
  isLoading = false;
  error: string | null = null;
  activeFilter: 'ALL' | 'OPEN' | 'CLOSED' = 'ALL';
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private isSearching = false;

  ngOnInit(): void {
    this.loadProjects();

    // Subscribe to project creation events
    this.projectsService.projectCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadProjects();
      });

    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.loadProjects(searchTerm);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  loadProjects(search?: string): void {
    // Verhindere isLoading = true bei Suchänderungen, um Input-Focus zu behalten
    if (!this.isSearching) {
      this.isLoading = true;
    }
    this.error = null;

    this.projectsService.findAllByRole(search).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
        this.isSearching = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        inject(ErrorService).handleHttpError(
          error,
          'Fehler beim Laden der Projekte'
        );
        this.error = 'Projekte konnten nicht geladen werden.';
        this.isLoading = false;
        this.isSearching = false;
        this.cdr.markForCheck();
      },
    });
  }

  openSettings(project: ProjectSummary, event: Event): void {
    event.stopPropagation();
    this.projectSettingsService.openSettings(project);
  }

  setFilter(filter: 'ALL' | 'OPEN' | 'CLOSED'): void {
    this.activeFilter = filter;
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.isSearching = true;
    this.searchSubject.next(searchTerm);
  }

  trackByProjectId(index: number, project: ProjectSummary): string {
    return project.id;
  }
}
