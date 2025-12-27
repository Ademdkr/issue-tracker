import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Centralized Error Service
 *
 * Provides consistent error handling and user notifications across the application.
 * Replaces console.error statements with structured error logging and user-friendly messages.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private snackBar = inject(MatSnackBar);

  /**
   * Default SnackBar configuration
   */
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  /**
   * Handle HTTP errors from API calls
   */
  handleHttpError(error: HttpErrorResponse, context: string): void {
    const message = this.extractErrorMessage(error);
    this.showError(`${context}: ${message}`);
    this.logError(context, error);
  }

  /**
   * Handle generic errors (non-HTTP)
   */
  handleError(error: unknown, context: string): void {
    const message = this.extractGenericErrorMessage(error);
    this.showError(`${context}: ${message}`);
    this.logError(context, error);
  }

  /**
   * Show error message to user via SnackBar
   */
  showError(message: string, duration?: number): void {
    this.snackBar.open(message, 'Schließen', {
      ...this.defaultConfig,
      duration: duration ?? this.defaultConfig.duration,
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Show success message to user via SnackBar
   */
  showSuccess(message: string, duration?: number): void {
    this.snackBar.open(message, 'OK', {
      ...this.defaultConfig,
      duration: duration ?? this.defaultConfig.duration,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Show warning message to user via SnackBar
   */
  showWarning(message: string, duration?: number): void {
    this.snackBar.open(message, 'Verstanden', {
      ...this.defaultConfig,
      duration: duration ?? this.defaultConfig.duration,
      panelClass: ['warning-snackbar'],
    });
  }

  /**
   * Show info message to user via SnackBar
   */
  showInfo(message: string, duration?: number): void {
    this.snackBar.open(message, 'OK', {
      ...this.defaultConfig,
      duration: duration ?? this.defaultConfig.duration,
      panelClass: ['info-snackbar'],
    });
  }

  /**
   * Extract user-friendly error message from HttpErrorResponse
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    // Backend error message
    if (error.error?.message) {
      return error.error.message;
    }

    // HTTP status code messages
    switch (error.status) {
      case 0:
        return 'Keine Verbindung zum Server';
      case 400:
        return 'Ungültige Anfrage';
      case 401:
        return 'Nicht autorisiert';
      case 403:
        return 'Zugriff verweigert';
      case 404:
        return 'Ressource nicht gefunden';
      case 409:
        return 'Konflikt - Ressource existiert bereits';
      case 422:
        return 'Validierungsfehler';
      case 500:
        return 'Interner Serverfehler';
      case 503:
        return 'Service nicht verfügbar';
      default:
        return error.message || 'Ein unbekannter Fehler ist aufgetreten';
    }
  }

  /**
   * Extract message from generic error object
   */
  private extractGenericErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Ein unbekannter Fehler ist aufgetreten';
  }

  /**
   * Log error to console (development) or error tracking service (production)
   */
  private logError(context: string, error: unknown): void {
    const timestamp = new Date().toISOString();

    // In production, send to error tracking service (e.g., Sentry)
    if (this.isProduction()) {
      // TODO: Integrate with error tracking service
      const errorInfo = {
        timestamp,
        context,
        error: this.serializeError(error),
      };
      // e.g., Sentry.captureException(error, { extra: errorInfo });
      console.error('[ErrorService]', errorInfo);
    } else {
      // In development, log to console
      console.error(`[${timestamp}] [${context}]`, error);
    }
  }

  /**
   * Serialize error for logging
   */
  private serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof HttpErrorResponse) {
      return {
        type: 'HttpError',
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        url: error.url,
        error: error.error,
      };
    }
    if (error instanceof Error) {
      return {
        type: 'Error',
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return {
      type: 'Unknown',
      value: String(error),
    };
  }

  /**
   * Check if running in production
   */
  private isProduction(): boolean {
    return false; // TODO: Read from environment configuration
  }
}
