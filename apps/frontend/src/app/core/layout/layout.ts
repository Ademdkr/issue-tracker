import { Component, OnInit } from '@angular/core';
import {
  RouterOutlet,
  Router,
  Navigation,
  RouterLinkWithHref,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ProjectsService } from '../services/projects.service';
import { ProjectSettingsService } from '../services/project-settings.service';
import { TicketDialogService } from '../services/ticket-dialog.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { filter, map } from 'rxjs';
import { CreateProjectForm } from '../../features/projects/components/create-project-form/create-project-form';
import { GeneralSettingsForm } from '../../features/projects/components/general-settings-form/general-settings-form';
import { UserRole, ProjectSummary } from '@issue-tracker/shared-types';

export interface NavigationItem {
  /** Material Icon Name */
  icon: string;
  /** Anzeigetext */
  label: string;
  /** Router-Pfad */
  route: string;
  /** Aktiv-Status (optional, wird dynamisch gesetzt) */
  active?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    RouterLinkWithHref,
    MatButtonModule,
    MatSnackBarModule,
    CreateProjectForm,
    GeneralSettingsForm,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  pageTitle = '';
  pageSubtitle = '';
  showNewProjectButton = false;
  showNewTicketButton = false;
  showCreateProjectForm = false;
  showSettingsForm = false;
  selectedProject: ProjectSummary | null = null;

  navigationItems: NavigationItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'assignment', label: 'Projects', route: '/projects' },
    { icon: 'confirmation_number', label: 'Tickets', route: '/tickets' },
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private projectsService: ProjectsService,
    private projectSettingsService: ProjectSettingsService,
    private ticketDialogService: TicketDialogService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // ✅ WICHTIG: Initial Route-Daten laden
    this.updateToolbarFromRoute();

    // ✅ Dann auf Route-Änderungen lauschen
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateToolbarFromRoute();
      });

    // Listen to project settings events
    this.projectSettingsService.openSettings$.subscribe((project) => {
      this.selectedProject = project;
      this.showSettingsForm = true;
    });

    this.projectSettingsService.closeSettings$.subscribe(() => {
      this.showSettingsForm = false;
      this.selectedProject = null;
    });
  }

  private updateToolbarFromRoute() {
    const data = this.getRouteData();
    const currentUser = this.authService.getCurrentUser();
    const canCreateProject =
      currentUser?.role === UserRole.ADMIN ||
      currentUser?.role === UserRole.MANAGER;

    this.pageTitle = data?.['title'] || '';
    this.pageSubtitle = data?.['subtitle'] || '';
    this.showNewProjectButton =
      (data?.['showNewProjectButton'] || false) && canCreateProject;
    this.showNewTicketButton = data?.['showNewTicketButton'] || false;
  }

  private getRouteData() {
    let route = this.activatedRoute.firstChild;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return route?.snapshot.data;
  }

  openCreateProjectForm(event: Event): void {
    event.stopPropagation();

    // Nur Admins und Manager dürfen Projekte erstellen
    const currentUser = this.authService.getCurrentUser();
    if (
      currentUser?.role === UserRole.ADMIN ||
      currentUser?.role === UserRole.MANAGER
    ) {
      this.showCreateProjectForm = true;
    } else {
      this.snackBar.open(
        'Nur Admins und Manager können Projekte erstellen',
        'Schließen',
        {
          duration: 3000,
        }
      );
    }
  }

  onCloseCreateProjectForm(): void {
    this.showCreateProjectForm = false;
  }

  onCreateProject(data: { name: string; description: string }): void {
    this.projectsService.create(data).subscribe({
      next: () => {
        this.snackBar.open('Projekt erfolgreich erstellt', 'Schließen', {
          duration: 3000,
        });

        this.onCloseCreateProjectForm();

        // Benachrichtige alle Listener (z.B. Projects-Component)
        this.projectsService.notifyProjectCreated();

        // Navigate to projects if not already there
        if (this.router.url !== '/projects') {
          this.router.navigate(['/projects']);
        }
      },
      error: (error: Error) => {
        console.error('Fehler beim Erstellen:', error);
        this.snackBar.open('Fehler beim Erstellen des Projekts', 'Schließen', {
          duration: 3000,
        });
      },
    });
  }

  onCloseSettings(): void {
    this.projectSettingsService.closeSettings();
  }

  onSaveSettings(data: Partial<ProjectSummary>): void {
    if (!this.selectedProject) return;

    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const updateObservable = isAdmin
      ? this.projectsService.adminUpdate(this.selectedProject.id, {
          name: data.name,
          description: data.description,
          slug: data.slug,
        })
      : this.projectsService.update(this.selectedProject.id, {
          name: data.name,
          description: data.description,
        });

    updateObservable.subscribe({
      next: () => {
        this.snackBar.open('Projekt erfolgreich aktualisiert', 'Schließen', {
          duration: 3000,
        });
        this.onCloseSettings();
        this.projectsService.notifyProjectCreated(); // Trigger reload
      },
      error: (error: Error) => {
        console.error('Fehler beim Aktualisieren:', error);
        this.snackBar.open(
          'Fehler beim Aktualisieren des Projekts',
          'Schließen',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  onDeleteProject(projectId: string): void {
    this.projectsService.delete(projectId).subscribe({
      next: () => {
        this.snackBar.open('Projekt erfolgreich gelöscht', 'Schließen', {
          duration: 3000,
        });
        this.onCloseSettings();
        this.projectsService.notifyProjectCreated(); // Trigger reload
      },
      error: (error: Error) => {
        console.error('Fehler beim Löschen:', error);
        this.snackBar.open('Fehler beim Löschen des Projekts', 'Schließen', {
          duration: 3000,
        });
      },
    });
  }

  openCreateTicketDialog(event: Event): void {
    event.stopPropagation();
    
    // Prüfe, ob wir in einem Projekt-Kontext sind
    const route = this.activatedRoute.firstChild;
    const projectId = route?.snapshot.paramMap.get('id');
    
    if (projectId) {
      // Wenn wir in einem Projekt sind, trigger Event für TicketsTab
      this.ticketDialogService.openCreateTicketDialog();
    } else {
      // Sonst öffne Dialog direkt hier (z.B. auf /tickets oder /dashboard)
      import('../../features/projects/project-detail/components/tickets-tab/components/create-ticket-dialog/create-ticket-dialog').then(
        (m) => {
          this.dialog.open(m.CreateTicketDialog, {
            width: '600px',
            data: {
              // Kein vorausgewähltes Projekt
            },
          });
        }
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
