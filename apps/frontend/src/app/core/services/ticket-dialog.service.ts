import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketDialogService {
  private openCreateTicketDialogSubject = new Subject<void>();
  public openCreateTicketDialog$ =
    this.openCreateTicketDialogSubject.asObservable();

  openCreateTicketDialog(): void {
    this.openCreateTicketDialogSubject.next();
  }
}
