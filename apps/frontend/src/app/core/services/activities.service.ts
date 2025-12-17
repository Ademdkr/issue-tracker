import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketActivityWithActor } from '@issue-tracker/shared-types';

/**
 * Activities Service
 * Handles HTTP requests for ticket activities (activity log)
 */
@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/projects';

  /**
   * Get all activities for a ticket
   */
  findAllByTicket(
    projectId: string,
    ticketId: string
  ): Observable<TicketActivityWithActor[]> {
    return this.http.get<TicketActivityWithActor[]>(
      `${this.apiUrl}/${projectId}/tickets/${ticketId}/activities`
    );
  }
}
