import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  // Login Route (public, ohne Layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },

  // Layout Route (Wrapper für alle geschützten Seiten)
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        data: {
          title: 'Dashboard',
          subtitle: 'Übersicht der Projekte und Tickets',
          showNewProjectButton: true,
          showNewTicketButton: true,
        },
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/projects').then((m) => m.Projects),
        data: {
          title: 'Projekte',
          subtitle: 'Übersicht der Projekte',
          showNewProjectButton: true,
        },
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/tickets').then((m) => m.Tickets),
        data: {
          title: 'Tickets',
          subtitle: 'Übersicht der Tickets',
          showNewTicketButton: true,
        },
      },
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
    ],
  },

  // Wildcard route - redirect to login
  {
    path: '**',
    redirectTo: 'login',
  },
];
