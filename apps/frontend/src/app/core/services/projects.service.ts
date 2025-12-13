import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  ProjectSummary,
  Project,
  ProjectMemberWithUser,
  Label,
} from '@issue-tracker/shared-types';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private projectCreatedSubject = new Subject<void>();

  projectCreated$ = this.projectCreatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Projects
  notifyProjectCreated(): void {
    this.projectCreatedSubject.next();
  }

  findAllByRole(search?: string): Observable<ProjectSummary[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ProjectSummary[]>(this.apiUrl, { params });
  }

  // NEU: Einzelnes Projekt laden (falls noch nicht vorhanden)
  findOne(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
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

  // Members
  findProjectMembers(projectId: string): Observable<ProjectMemberWithUser[]> {
    return this.http.get<ProjectMemberWithUser[]>(
      `${this.apiUrl}/${projectId}/members`
    );
  }

  findAvailableUsers(
    projectId: string,
    search?: string
  ): Observable<
    { id: string; name: string; surname: string; email: string }[]
  > {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<
      { id: string; name: string; surname: string; email: string }[]
    >(`${this.apiUrl}/${projectId}/members/available`, { params });
  }

  // Mitgleid hinzufügen
  addProjectMember(
    projectId: string,
    userId: string
  ): Observable<ProjectMemberWithUser> {
    return this.http.post<ProjectMemberWithUser>(
      `${this.apiUrl}/${projectId}/members`,
      { userId }
    );
  }

  // Mitglied entfernen
  removeProjectMember(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/members/${userId}`
    );
  }

  // Labels
  findProjectLabels(projectId: string): Observable<Label[]> {
    return this.http.get<Label[]>(`${this.apiUrl}/${projectId}/labels`);
  }

  createLabel(
    projectId: string,
    data: { name: string; color: string }
  ): Observable<Label> {
    return this.http.post<Label>(`${this.apiUrl}/${projectId}/labels`, data);
  }

  updateLabel(
    projectId: string,
    labelId: string,
    data: { name?: string; color?: string }
  ): Observable<Label> {
    return this.http.patch<Label>(
      `${this.apiUrl}/${projectId}/labels/${labelId}`,
      data
    );
  }

  deleteLabel(projectId: string, labelId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/labels/${labelId}`
    );
  }
}
