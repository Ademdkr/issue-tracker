import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ticket,
  TicketWithDetails,
  TicketFilters,
  CreateTicketDto,
  UpdateTicketDto,
} from '@issue-tracker/shared-types';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private readonly apiUrl = `${environment.apiUrl}/tickets`;
  private readonly projectsApiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  findAllByProject(
    projectId: string,
    filters?: TicketFilters
  ): Observable<TicketWithDetails[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.priority) {
        params = params.set('priority', filters.priority);
      }
      if (filters.assigneeId) {
        params = params.set('assigneeId', filters.assigneeId);
      }
      // TODO: Backend unterstützt aktuell nur einzelne labelId, nicht mehrere
      // if (filters.labelIds && filters.labelIds.length > 0) {
      //   params = params.set('labelId', filters.labelIds[0]);
      // }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }
    return this.http.get<TicketWithDetails[]>(
      `${this.projectsApiUrl}/${projectId}/tickets`,
      { params }
    );
  }

  createTicket(projectId: string, data: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.projectsApiUrl}/${projectId}/tickets`,
      data
    );
  }

  findOne(projectId: string, ticketId: string): Observable<TicketWithDetails> {
    return this.http.get<TicketWithDetails>(
      `${this.projectsApiUrl}/${projectId}/tickets/${ticketId}`
    );
  }

  updateTicket(
    projectId: string,
    ticketId: string,
    data: UpdateTicketDto
  ): Observable<TicketWithDetails> {
    return this.http.patch<TicketWithDetails>(
      `${this.projectsApiUrl}/${projectId}/tickets/${ticketId}`,
      data
    );
  }

  deleteTicket(projectId: string, ticketId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.projectsApiUrl}/${projectId}/tickets/${ticketId}`
    );
  }
}
