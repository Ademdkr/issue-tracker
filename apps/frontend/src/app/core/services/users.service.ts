// Angular Modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Environment
import { environment } from 'apps/frontend/src/environments/environment';

// Shared Types
import { User } from '@issue-tracker/shared-types';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
