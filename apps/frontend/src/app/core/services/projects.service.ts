import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ProjectSummary, Project } from '@issue-tracker/shared-types';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private projectCreatedSubject = new Subject<void>();

  projectCreated$ = this.projectCreatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  notifyProjectCreated(): void {
    this.projectCreatedSubject.next();
  }

  findAllByRole(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(this.apiUrl);
  }

  create(data: { name: string; description: string }): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data);
  }

  update(
    id: string,
    data: { name?: string; description?: string }
  ): Observable<ProjectSummary> {
    return this.http.patch<ProjectSummary>(`${this.apiUrl}/${id}`, data);
  }

  adminUpdate(
    id: string,
    data: { name?: string; description?: string; slug?: string }
  ): Observable<ProjectSummary> {
    return this.http.patch<ProjectSummary>(`${this.apiUrl}/${id}/admin`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
