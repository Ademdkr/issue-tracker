import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CommentWithAuthor,
  CreateCommentDto,
  UpdateCommentDto,
} from '@issue-tracker/shared-types';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/projects';

  /**
   * Alle Kommentare eines Tickets abrufen
   */
  findAll(
    projectId: string,
    ticketId: string
  ): Observable<CommentWithAuthor[]> {
    return this.http.get<CommentWithAuthor[]>(
      `${this.apiUrl}/${projectId}/tickets/${ticketId}/comments`
    );
  }

  /**
   * Neuen Kommentar erstellen
   */
  create(
    projectId: string,
    ticketId: string,
    dto: CreateCommentDto
  ): Observable<CommentWithAuthor> {
    return this.http.post<CommentWithAuthor>(
      `${this.apiUrl}/${projectId}/tickets/${ticketId}/comments`,
      dto
    );
  }

  /**
   * Kommentar aktualisieren
   */
  update(
    projectId: string,
    ticketId: string,
    commentId: string,
    dto: UpdateCommentDto
  ): Observable<CommentWithAuthor> {
    return this.http.patch<CommentWithAuthor>(
      `${this.apiUrl}/${projectId}/tickets/${ticketId}/comments/${commentId}`,
      dto
    );
  }

  /**
   * Kommentar löschen
   */
  delete(
    projectId: string,
    ticketId: string,
    commentId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/tickets/${ticketId}/comments/${commentId}`
    );
  }
}
