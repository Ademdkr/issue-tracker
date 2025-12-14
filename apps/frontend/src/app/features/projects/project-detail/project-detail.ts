import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Components
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Types
import { ProjectsService } from '../../../core/services/projects.service';
import { Project } from '@issue-tracker/shared-types';
import { TicketsTab } from './components/tickets-tab/tickets-tab';
import { ManagementTab } from './components/management-tab/management-tab';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    TicketsTab,
    ManagementTab,
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail implements OnInit, OnDestroy {
  // State Management (analog zu projects.ts  )
  project: Project | null = null;
  isLoading = false;
  error: string | null = null;

  // RxJS für Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // 1. Route-Parameter auslesen
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.loadProject(projectId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProject(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.projectsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.project = project;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Fehler beim Laden des Projekts:', error);
          this.error = 'Projekt konnte nicht geladen werden.';
          this.isLoading = false;

          this.snackBar.open('Fehler beim Laden des Projekts', 'Schließen', {
            duration: 3000,
          });
        },
      });
  }
}
