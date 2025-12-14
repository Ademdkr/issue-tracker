import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { TicketsService } from '../../../../../core/services/tickets.service';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { AuthService } from '../../../../../core/services/auth.service';

// Types
import {
  TicketWithDetails,
  TicketStatus,
  TicketPriority,
  UpdateTicketDto,
  Label,
  UserRole,
  ProjectMemberWithUser,
  Project,
} from '@issue-tracker/shared-types';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-ticket-overview-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './ticket-overview-tab.html',
  styleUrl: './ticket-overview-tab.scss',
})
export class TicketOverviewTab implements OnInit, OnDestroy {
  @Input() ticket!: TicketWithDetails;
  @Input() projectId!: string;
  @Output() ticketUpdated = new EventEmitter<TicketWithDetails>();
  @Output() ticketDeleted = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private ticketsService = inject(TicketsService);
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ticketForm!: FormGroup;
  currentUser = this.authService.getCurrentUser()!;

  // Options
  statusOptions = Object.values(TicketStatus);
  priorityOptions = Object.values(TicketPriority);
  assigneeOptions: { value: string; label: string }[] = [];
  projectOptions: { value: string; label: string }[] = [];
  availableLabels: Label[] = [];

  // Permissions
  canEditTitle = false;
  canEditDescription = false;
  canEditStatus = false;
  canEditPriority = false;
  canEditAssignee = false;
  canEditProject = false;
  canEditLabels = false;
  canDeleteTicket = false;

  isLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
    this.checkPermissions();
    this.applyPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.ticketForm = this.fb.group({
      title: [
        this.ticket.title,
        [Validators.required, Validators.maxLength(200)],
      ],
      description: [this.ticket.description, Validators.required],
      status: [this.ticket.status, Validators.required],
      priority: [this.ticket.priority, Validators.required],
      assigneeId: [this.ticket.assigneeId || ''],
      projectId: [this.ticket.projectId, Validators.required],
    });
  }

  loadOptions(): void {
    // Load assignees
    this.projectsService
      .findProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((members: ProjectMemberWithUser[]) => {
        this.assigneeOptions = [
          { value: '', label: 'Nicht zugewiesen' },
          ...members
            .filter((m: ProjectMemberWithUser) => m.user)
            .map((m: ProjectMemberWithUser) => ({
              value: m.user!.id,
              label: `${m.user!.name} ${m.user!.surname}`,
            })),
        ];
      });

    // Projects: Set only current project (editing not supported)
    if (this.ticket.project) {
      this.projectOptions = [
        {
          value: this.ticket.project.id,
          label: this.ticket.project.name,
        },
      ];
    }

    // Load labels
    this.projectsService
      .findProjectLabels(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((labels: Label[]) => {
        this.availableLabels = labels;
      });
  }

  checkPermissions(): void {
    const role = this.currentUser.role;
    const isCreator = this.ticket.reporterId === this.currentUser.id;
    const isAssignee = this.ticket.assigneeId === this.currentUser.id;
    const isManager = role === UserRole.MANAGER;
    const isAdmin = role === UserRole.ADMIN;
    const isDeveloper = role === UserRole.DEVELOPER;

    // Title & Description: Creator, Assignee, Manager, Admin
    this.canEditTitle = isCreator || isAssignee || isManager || isAdmin;
    this.canEditDescription = isCreator || isAssignee || isManager || isAdmin;

    // Status: Rollenbasiert mit State Machine
    this.canEditStatus = isDeveloper || isManager || isAdmin;

    // Priority: Not Reporter (unless creator/assignee) or Manager/Admin
    this.canEditPriority =
      role !== UserRole.REPORTER ||
      isCreator ||
      isAssignee ||
      isManager ||
      isAdmin;

    // Assignee: Developer can self-assign, Manager/Admin can assign anyone
    if (role === UserRole.DEVELOPER) {
      this.canEditAssignee = true; // Will restrict in form
    } else {
      this.canEditAssignee = isManager || isAdmin;
    }

    // Project: Cannot be changed after creation (requires API support)
    this.canEditProject = false;

    // Labels: Creator, Assignee, Manager, Admin
    this.canEditLabels = isCreator || isAssignee || isManager || isAdmin;

    // Delete: Manager, Admin
    this.canDeleteTicket = isManager || isAdmin;
  }

  applyPermissions(): void {
    if (!this.canEditTitle) this.ticketForm.get('title')?.disable();
    if (!this.canEditDescription) this.ticketForm.get('description')?.disable();
    if (!this.canEditStatus) this.ticketForm.get('status')?.disable();
    if (!this.canEditPriority) this.ticketForm.get('priority')?.disable();
    if (!this.canEditAssignee) this.ticketForm.get('assigneeId')?.disable();
    if (!this.canEditProject) this.ticketForm.get('projectId')?.disable();
  }

  onSubmit(): void {
    if (this.ticketForm.invalid || this.isLoading) return;

    // Get only changed values
    const formValue = this.ticketForm.getRawValue();
    const updateData: UpdateTicketDto = {};

    if (formValue.title !== this.ticket.title)
      updateData.title = formValue.title;
    if (formValue.description !== this.ticket.description)
      updateData.description = formValue.description;
    if (formValue.status !== this.ticket.status)
      updateData.status = formValue.status;
    if (formValue.priority !== this.ticket.priority)
      updateData.priority = formValue.priority;
    if (formValue.assigneeId !== this.ticket.assigneeId)
      updateData.assigneeId = formValue.assigneeId || null;
    // Note: projectId is not editable via API, requires ticket recreation

    if (Object.keys(updateData).length === 0) {
      this.snackBar.open('Keine Änderungen vorhanden', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }

    this.isLoading = true;

    this.ticketsService
      .updateTicket(this.projectId, this.ticket.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTicket: TicketWithDetails) => {
          this.snackBar.open('Ticket erfolgreich aktualisiert', 'Schließen', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.ticket = updatedTicket;
          // Formular mit neuen Werten aktualisieren (für pristine state)
          this.ticketForm.patchValue({
            title: updatedTicket.title,
            description: updatedTicket.description,
            status: updatedTicket.status,
            priority: updatedTicket.priority,
            assigneeId: updatedTicket.assigneeId || '',
            projectId: updatedTicket.projectId,
          });
          this.ticketForm.markAsPristine();
          this.ticketUpdated.emit(updatedTicket);
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.snackBar.open(
            'Fehler beim Aktualisieren des Tickets',
            'Schließen',
            {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            }
          );
          console.error('Error updating ticket:', err);
          this.isLoading = false;
        },
      });
  }

  onDeleteTicket(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Ticket löschen',
        message: `Möchten Sie das Ticket "${this.ticket.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteTicket();
      }
    });
  }

  private deleteTicket(): void {
    this.isLoading = true;

    this.ticketsService
      .deleteTicket(this.projectId, this.ticket.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Ticket erfolgreich gelöscht', 'Schließen', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.ticketDeleted.emit();
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.snackBar.open('Fehler beim Löschen des Tickets', 'Schließen', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          console.error('Error deleting ticket:', err);
          this.isLoading = false;
        },
      });
  }

  removeLabel(labelId: string): void {
    if (!this.canEditLabels) return;

    const updatedLabelIds = this.ticket.ticketLabels
      .map((tl: { labelId: string; ticketId: string }) => tl.labelId)
      .filter((id: string) => id !== labelId);

    this.updateTicketLabels(updatedLabelIds);
  }

  addLabel(labelId: string): void {
    if (!this.canEditLabels) return;

    const currentLabelIds = this.ticket.ticketLabels.map(
      (tl: { labelId: string; ticketId: string }) => tl.labelId
    );
    if (currentLabelIds.includes(labelId)) {
      this.snackBar.open('Label ist bereits hinzugefügt', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }

    const updatedLabelIds = [...currentLabelIds, labelId];
    this.updateTicketLabels(updatedLabelIds);
  }

  private updateTicketLabels(labelIds: string[]): void {
    this.isLoading = true;

    this.ticketsService
      .updateTicket(this.projectId, this.ticket.id, { labelIds })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTicket: TicketWithDetails) => {
          this.snackBar.open('Labels erfolgreich aktualisiert', 'Schließen', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.ticket = updatedTicket;
          this.ticketUpdated.emit(updatedTicket);
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.snackBar.open(
            'Fehler beim Aktualisieren der Labels',
            'Schließen',
            {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            }
          );
          console.error('Error updating labels:', err);
          this.isLoading = false;
        },
      });
  }

  getAvailableLabelsToAdd(): Label[] {
    const currentLabelIds = this.ticket.ticketLabels.map(
      (tl: { labelId: string; ticketId: string }) => tl.labelId
    );
    return this.availableLabels.filter(
      (label: Label) => !currentLabelIds.includes(label.id)
    );
  }

  getLabelById(labelId: string): Label | undefined {
    return this.availableLabels.find((label) => label.id === labelId);
  }

  getStatusLabel(status: TicketStatus): string {
    const labels: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'Offen',
      [TicketStatus.IN_PROGRESS]: 'In Bearbeitung',
      [TicketStatus.RESOLVED]: 'Gelöst',
      [TicketStatus.CLOSED]: 'Geschlossen',
    };
    return labels[status];
  }

  getPriorityLabel(priority: TicketPriority): string {
    const labels: Record<TicketPriority, string> = {
      [TicketPriority.LOW]: 'Niedrig',
      [TicketPriority.MEDIUM]: 'Mittel',
      [TicketPriority.HIGH]: 'Hoch',
      [TicketPriority.CRITICAL]: 'Kritisch',
    };
    return labels[priority];
  }

  getAvailableStatusOptions(): TicketStatus[] {
    const role = this.currentUser.role;
    const currentStatus = this.ticket.status;
    const isManager = role === UserRole.MANAGER;
    const isAdmin = role === UserRole.ADMIN;
    const isDeveloper = role === UserRole.DEVELOPER;

    // Admin und Manager können alle Status setzen
    if (isAdmin || isManager) {
      return Object.values(TicketStatus);
    }

    // Developer: State Machine Übergänge
    if (isDeveloper) {
      switch (currentStatus) {
        case TicketStatus.OPEN:
          return [TicketStatus.OPEN, TicketStatus.IN_PROGRESS];
        case TicketStatus.IN_PROGRESS:
          return [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED];
        case TicketStatus.RESOLVED:
          return [TicketStatus.RESOLVED]; // Kann nicht zurück
        case TicketStatus.CLOSED:
          return [TicketStatus.CLOSED]; // Kann nicht mehr ändern
        default:
          return [currentStatus];
      }
    }

    // Andere Rollen: Nur aktuellen Status anzeigen (read-only)
    return [currentStatus];
  }

  canChangeStatus(): boolean {
    const availableOptions = this.getAvailableStatusOptions();
    return availableOptions.length > 1;
  }

  startWork(): void {
    if (
      this.ticket.status === TicketStatus.OPEN &&
      this.currentUser.role === UserRole.DEVELOPER
    ) {
      this.ticketForm.patchValue({ status: TicketStatus.IN_PROGRESS });
      this.onSubmit();
    }
  }

  markAsResolved(): void {
    if (
      this.ticket.status === TicketStatus.IN_PROGRESS &&
      this.currentUser.role === UserRole.DEVELOPER
    ) {
      this.ticketForm.patchValue({ status: TicketStatus.RESOLVED });
      this.onSubmit();
    }
  }

  closeTicket(): void {
    const role = this.currentUser.role;
    if (
      this.ticket.status === TicketStatus.RESOLVED &&
      (role === UserRole.MANAGER || role === UserRole.ADMIN)
    ) {
      this.ticketForm.patchValue({ status: TicketStatus.CLOSED });
      this.onSubmit();
    }
  }
}
