import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Modules
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

// Services
import { ActivitiesService } from '../../../../../core/services/activities.service';
import { ErrorService } from '../../../../../core/services/error.service';

// Types
import {
  TicketActivityWithActor,
  TicketActivityType,
  TicketWithDetails,
} from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-activity-tab',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './ticket-activity-tab.html',
  styleUrl: './ticket-activity-tab.scss',
})
export class TicketActivityTab implements OnInit, OnChanges, OnDestroy {
  @Input() ticket!: TicketWithDetails;
  @Input() projectId!: string;

  private destroy$ = new Subject<void>();
  private activitiesService = inject(ActivitiesService);

  activities: TicketActivityWithActor[] = [];
  isLoading = false;
  error: string | null = null;

  // Expose enum to template
  ActivityType = TicketActivityType;

  ngOnInit(): void {
    this.loadActivities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload activities when ticket changes (status, assignee, etc.)
    if (changes['ticket'] && !changes['ticket'].firstChange) {
      this.loadActivities();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActivities(): void {
    if (!this.projectId || !this.ticket?.id) return;

    this.isLoading = true;
    this.error = null;

    this.activitiesService
      .findAllByTicket(this.projectId, this.ticket.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities) => {
          this.activities = activities;
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.error = 'Fehler beim Laden der Aktivitäten.';
          inject(ErrorService).handleHttpError(
            err,
            'Fehler beim Laden der Aktivitäten'
          );
          this.isLoading = false;
        },
      });
  }

  /**
   * Get icon name for activity type
   */
  getActivityIcon(type: TicketActivityType): string {
    switch (type) {
      case TicketActivityType.STATUS_CHANGE:
        return 'sync_alt';
      case TicketActivityType.ASSIGNEE_CHANGE:
        return 'person';
      case TicketActivityType.LABEL_ADDED:
        return 'add_circle_outline';
      case TicketActivityType.LABEL_REMOVED:
        return 'remove_circle_outline';
      default:
        return 'info';
    }
  }

  /**
   * Get CSS class for activity type
   */
  getActivityClass(type: TicketActivityType): string {
    switch (type) {
      case TicketActivityType.STATUS_CHANGE:
        return 'activity-status-change';
      case TicketActivityType.ASSIGNEE_CHANGE:
        return 'activity-assignee-change';
      case TicketActivityType.LABEL_ADDED:
        return 'activity-label-added';
      case TicketActivityType.LABEL_REMOVED:
        return 'activity-label-removed';
      default:
        return 'activity-default';
    }
  }

  /**
   * Get formatted activity description
   */
  getActivityDescription(activity: TicketActivityWithActor): string {
    const actorName = activity.actor
      ? `${activity.actor.name} ${activity.actor.surname}`
      : 'Unbekannt';
    const detail = activity.detail;

    switch (activity.activityType) {
      case TicketActivityType.STATUS_CHANGE: {
        const oldStatus = detail.oldValue
          ? this.translateStatus(detail.oldValue as string)
          : null;
        const newStatus = detail.newValue
          ? this.translateStatus(detail.newValue as string)
          : null;

        if (oldStatus && newStatus) {
          return `${actorName} hat den Status von "${oldStatus}" zu "${newStatus}" geändert`;
        }
        if (newStatus) {
          return `${actorName} hat den Status auf "${newStatus}" gesetzt`;
        }
        return `${actorName} hat den Status geändert`;
      }

      case TicketActivityType.ASSIGNEE_CHANGE: {
        const oldName = detail['oldAssigneeName'] as string | undefined;
        const newName = detail['newAssigneeName'] as string | undefined;
        const oldId = detail.oldValue as string | null | undefined;
        const newId = detail.newValue as string | null | undefined;

        if (oldName && newName) {
          return `${actorName} hat das Ticket von "${oldName}" an "${newName}" übergeben`;
        }
        if (newName) {
          return `${actorName} hat das Ticket an "${newName}" zugewiesen`;
        }
        if (oldName) {
          return `${actorName} hat "${oldName}" als Assignee entfernt`;
        }

        // Fallback wenn Namen fehlen aber IDs vorhanden sind
        if (oldId && newId) {
          return `${actorName} hat den Assignee gewechselt`;
        }
        if (newId) {
          return `${actorName} hat einen Assignee zugewiesen`;
        }
        if (oldId === null && newId === null) {
          return `${actorName} hat den Assignee entfernt`;
        }

        return `${actorName} hat den Assignee geändert`;
      }

      case TicketActivityType.LABEL_ADDED: {
        const labelName = detail['labelName'] as string | undefined;
        if (labelName) {
          return `${actorName} hat das Label "${labelName}" hinzugefügt`;
        }
        return `${actorName} hat ein Label hinzugefügt`;
      }

      case TicketActivityType.LABEL_REMOVED: {
        const labelName = detail['labelName'] as string | undefined;
        if (labelName) {
          return `${actorName} hat das Label "${labelName}" entfernt`;
        }
        return `${actorName} hat ein Label entfernt`;
      }

      default:
        return `${actorName} hat eine Änderung vorgenommen`;
    }
  }

  /**
   * Get detail text for activity (not needed anymore as description contains all info)
   */
  getActivityDetail(activity: TicketActivityWithActor): string | null {
    // Details are now included in the main description for better readability
    return null;
  }

  /**
   * Translate status enum to German
   */
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      OPEN: 'Offen',
      IN_PROGRESS: 'In Bearbeitung',
      RESOLVED: 'Gelöst',
      CLOSED: 'Geschlossen',
    };
    return translations[status] || status;
  }

  /**
   * Format date to readable string
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `Vor ${diffMins} Min.`;
    if (diffHours < 24) return `Vor ${diffHours} Std.`;
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
