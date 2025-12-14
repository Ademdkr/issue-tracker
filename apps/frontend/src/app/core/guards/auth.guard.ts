import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 *
 * Schützt Routen vor unauthentifizierten Zugriffen.
 * Leitet zum Login um, wenn User nicht eingeloggt ist.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Nicht eingeloggt -> Redirect zum Login
  return router.createUrlTree(['/login']);
};
