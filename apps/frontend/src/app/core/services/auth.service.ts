import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {
  User,
  UserRole,
  LoginDto,
  LoginResponse,
} from '@issue-tracker/shared-types';
import { environment } from '../../../environments/environment';

/**
 * Authentication Service
 *
 * Verwaltet Login, Logout, JWT-Token und aktuellen User-Status.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';

  // Observable für Login-Status
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Observable für aktuellen User
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login-Funktion
   *
   * Sendet Credentials an Backend, speichert JWT-Token und User-Daten.
   *
   * @param credentials - Email und Passwort
   * @returns Observable mit LoginResponse
   */
  login(credentials: LoginDto): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          // Token und User speichern
          this.setToken(response.access_token);
          this.setUser(response.user);

          // Observables aktualisieren
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout-Funktion
   *
   * Löscht Token und User-Daten aus LocalStorage.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Prüft ob User eingeloggt ist
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * Gibt JWT-Token zurück
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Gibt aktuellen User zurück
   */
  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  /**
   * Speichert JWT-Token in LocalStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Speichert User-Daten in LocalStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Prüft ob Token vorhanden ist
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Lädt User aus LocalStorage
   */
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Error Handler für HTTP Requests
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ein Fehler ist aufgetreten';

    if (error.error instanceof ErrorEvent) {
      // Client-seitiger Fehler
      errorMessage = `Fehler: ${error.error.message}`;
    } else {
      // Backend-Fehler
      if (error.status === 401) {
        errorMessage = 'Ungültige Anmeldedaten';
      } else if (error.status === 0) {
        errorMessage = 'Backend nicht erreichbar';
      } else {
        errorMessage = error.error?.message || `Server-Fehler: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
