import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * HTTP Error Interceptor
 *
 * Zentrale Error-Behandlung für alle HTTP-Requests:
 * - 401 Unauthorized: Token abgelaufen oder ungültig → Redirect zu Login
 * - 403 Forbidden: Keine Berechtigung für die Ressource
 * - 404 Not Found: Ressource existiert nicht
 * - 500 Server Error: Interner Server-Fehler
 *
 * Zeigt user-freundliche Fehlermeldungen in MatSnackBar.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

      if (error.error instanceof ErrorEvent) {
        // Client-seitiger Fehler
        errorMessage = `Fehler: ${error.error.message}`;
      } else {
        // Server-seitiger Fehler
        switch (error.status) {
          case 401:
            errorMessage =
              'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
            // Token ungültig → Logout und Redirect zu Login
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            router.navigate(['/login']);
            break;

          case 403:
            errorMessage = 'Sie haben keine Berechtigung für diese Aktion.';
            break;

          case 404:
            errorMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
            break;

          case 400:
            // Validierungsfehler vom Backend
            if (error.error?.message) {
              if (Array.isArray(error.error.message)) {
                errorMessage = error.error.message.join(', ');
              } else {
                errorMessage = error.error.message;
              }
            } else {
              errorMessage =
                'Ungültige Eingabe. Bitte überprüfen Sie Ihre Daten.';
            }
            break;

          case 500:
            errorMessage =
              'Server-Fehler. Bitte versuchen Sie es später erneut.';
            break;

          case 0:
            // Network Error (Backend nicht erreichbar)
            errorMessage =
              'Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung.';
            break;

          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `Fehler ${error.status}: ${error.statusText}`;
            }
        }
      }

      // Zeige Fehlermeldung in SnackBar
      snackBar.open(errorMessage, 'Schließen', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });

      // Error weiterreichen für weitere Behandlung
      return throwError(() => error);
    })
  );
};
