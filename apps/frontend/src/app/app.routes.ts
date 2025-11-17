import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  // Redirect root to login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Login Route (public)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // Protected Routes (require authentication)
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },

  // Wildcard route - redirect to login
  {
    path: '**',
    redirectTo: '/login',
  },
];
