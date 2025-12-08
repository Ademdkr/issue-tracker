import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProjectSummary } from '@issue-tracker/shared-types';

@Injectable({
  providedIn: 'root',
})
export class ProjectSettingsService {
  private openSettingsSubject = new Subject<ProjectSummary>();
  private closeSettingsSubject = new Subject<void>();

  openSettings$ = this.openSettingsSubject.asObservable();
  closeSettings$ = this.closeSettingsSubject.asObservable();

  openSettings(project: ProjectSummary): void {
    this.openSettingsSubject.next(project);
  }

  closeSettings(): void {
    this.closeSettingsSubject.next();
  }
}
