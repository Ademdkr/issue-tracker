// apps/frontend/src/app/features/projects/projects.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectSettingsService } from '../../core/services/project-settings.service';

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDivider,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit, OnDestroy {
  projects: ProjectSummary[] = [];
  isLoading = false;
  error: string | null = null;
  activeFilter: 'ALL' | 'OPEN' | 'CLOSED' = 'ALL';
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private isSearching = false;

  constructor(
    private projectsService: ProjectsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private projectSettingsService: ProjectSettingsService
  ) {}

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
      },
      error: (error) => {
        console.error('Fehler beim Laden der Projekte:', error);
        this.error = 'Projekte konnten nicht geladen werden.';
        this.isLoading = false;
        this.isSearching = false;

        this.snackBar.open('Fehler beim Laden der Projekte', 'Schließen', {
          duration: 3000,
        });
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

/* projects: ProjectSummary[] = [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'E-Commerce Platform Redesign',
      description:
        'Komplette Neugestaltung der E-Commerce-Plattform mit modernem UI/UX und optimierter Performance.',
      slug: 'ecommerce-platform-redesign',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-01-15'),
      ticketCount: 142,
      memberCount: 12,
      ticketsByStatus: {
        open: 23,
        inProgress: 18,
        resolved: 89,
        closed: 12,
      },
      createdBy: {
        id: 'user-001',
        name: 'Sarah',
        surname: 'Schmidt',
      },
    },
    {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      name: 'Mobile App Development',
      description:
        'Entwicklung einer nativen Mobile App für iOS und Android mit React Native.',
      slug: 'mobile-app-development',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-03-22'),
      ticketCount: 87,
      memberCount: 8,
      ticketsByStatus: {
        open: 15,
        inProgress: 22,
        resolved: 45,
        closed: 5,
      },
      createdBy: {
        id: 'user-002',
        name: 'Michael',
        surname: 'Müller',
      },
    },
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      name: 'Database Migration',
      description:
        'Migration von MySQL zu PostgreSQL mit vollständiger Datenmigration und Schema-Optimierung.',
      slug: 'database-migration',
      status: ProjectStatus.CLOSED,
      createdAt: new Date('2023-11-10'),
      ticketCount: 34,
      memberCount: 5,
      ticketsByStatus: {
        open: 0,
        inProgress: 0,
        resolved: 2,
        closed: 32,
      },
      createdBy: {
        id: 'user-003',
        name: 'Anna',
        surname: 'Weber',
      },
    },
    {
      id: 'd4e5f6a7-b8c9-0123-def1-234567890123',
      name: 'Customer Portal',
      description:
        'Self-Service Portal für Kunden mit Ticket-Management und Wissensdatenbank.',
      slug: 'customer-portal',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-05-08'),
      ticketCount: 63,
      memberCount: 7,
      ticketsByStatus: {
        open: 12,
        inProgress: 8,
        resolved: 38,
        closed: 5,
      },
      createdBy: {
        id: 'user-004',
        name: 'Thomas',
        surname: 'Fischer',
      },
    },
    {
      id: 'e5f6a7b8-c9d0-1234-ef12-345678901234',
      name: 'API Documentation',
      description:
        'Erstellung einer umfassenden API-Dokumentation mit OpenAPI/Swagger und Beispielen.',
      slug: 'api-documentation',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-02-14'),
      ticketCount: 18,
      memberCount: 3,
      ticketsByStatus: {
        open: 8,
        inProgress: 2,
        resolved: 6,
        closed: 2,
      },
      createdBy: {
        id: 'user-005',
        name: 'Julia',
        surname: 'Wagner',
      },
    },
    {
      id: 'f6a7b8c9-d0e1-2345-f123-456789012345',
      name: 'Security Audit 2024',
      description:
        'Jährliches Security Audit mit Penetration Testing und Schwachstellenanalyse.',
      slug: 'security-audit-2024',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-06-01'),
      ticketCount: 45,
      memberCount: 6,
      ticketsByStatus: {
        open: 18,
        inProgress: 12,
        resolved: 13,
        closed: 2,
      },
      createdBy: {
        id: 'user-006',
        name: 'David',
        surname: 'Becker',
      },
    },
    {
      id: 'a7b8c9d0-e1f2-3456-1234-567890123456',
      name: 'Performance Optimization',
      description:
        'Optimierung der Ladezeiten und Performance durch Code-Splitting und Caching-Strategien.',
      slug: 'performance-optimization',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-04-19'),
      ticketCount: 52,
      memberCount: 9,
      ticketsByStatus: {
        open: 8,
        inProgress: 15,
        resolved: 25,
        closed: 4,
      },
      createdBy: {
        id: 'user-007',
        name: 'Laura',
        surname: 'Hoffmann',
      },
    },
    {
      id: 'b8c9d0e1-f2a3-4567-2345-678901234567',
      name: 'Internal Dashboard',
      description:
        'Internes Dashboard für Team-Metriken, KPIs und Projekt-Übersichten.',
      slug: 'internal-dashboard',
      status: ProjectStatus.CLOSED,
      createdAt: new Date('2023-08-05'),
      ticketCount: 28,
      memberCount: 4,
      ticketsByStatus: {
        open: 0,
        inProgress: 0,
        resolved: 3,
        closed: 25,
      },
      createdBy: {
        id: 'user-008',
        name: 'Markus',
        surname: 'Schulz',
      },
    },
    {
      id: 'c9d0e1f2-a3b4-5678-3456-789012345678',
      name: 'Notification System',
      description:
        'Echtzeit-Benachrichtigungssystem mit E-Mail, Push und In-App-Notifications.',
      slug: 'notification-system',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-07-12'),
      ticketCount: 39,
      memberCount: 5,
      ticketsByStatus: {
        open: 14,
        inProgress: 9,
        resolved: 14,
        closed: 2,
      },
      createdBy: {
        id: 'user-009',
        name: 'Sophie',
        surname: 'Klein',
      },
    },
    {
      id: 'd0e1f2a3-b4c5-6789-4567-890123456789',
      name: 'User Authentication Revamp',
      description:
        'Modernisierung des Authentifizierungssystems mit OAuth2, 2FA und SSO-Integration.',
      slug: 'user-authentication-revamp',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-08-20'),
      ticketCount: 31,
      memberCount: 6,
      ticketsByStatus: {
        open: 7,
        inProgress: 11,
        resolved: 11,
        closed: 2,
      },
      createdBy: {
        id: 'user-010',
        name: 'Felix',
        surname: 'Richter',
      },
    },
    {
      id: 'e1f2a3b4-c5d6-7890-5678-901234567890',
      name: 'Reporting Module',
      description:
        'Entwicklung eines flexiblen Reporting-Moduls mit anpassbaren Dashboards und Export-Funktionen.',
      slug: 'reporting-module',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-09-15'),
      ticketCount: 12,
      memberCount: 3,
      ticketsByStatus: {
        open: 10,
        inProgress: 2,
        resolved: 0,
        closed: 0,
      },
      createdBy: {
        id: 'user-011',
        name: 'Emma',
        surname: 'Zimmermann',
      },
    },
    {
      id: 'f2a3b4c5-d6e7-8901-6789-012345678901',
      name: 'Legacy System Integration',
      description:
        'Integration bestehender Legacy-Systeme über REST-APIs und Middleware-Lösungen.',
      slug: 'legacy-system-integration',
      status: ProjectStatus.OPEN,
      createdAt: new Date('2024-01-30'),
      ticketCount: 8,
      memberCount: 15,
      ticketsByStatus: {
        open: 3,
        inProgress: 1,
        resolved: 3,
        closed: 1,
      },
      createdBy: {
        id: 'user-012',
        name: 'Jonas',
        surname: 'Koch',
      },
    },
  ]; */
