// Angular Modules
import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Material Modules
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// RxJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { TicketsService } from '../../../../../../../core/services/tickets.service';
import { ProjectsService } from '../../../../../../../core/services/projects.service';
import { AuthService } from '../../../../../../../core/services/auth.service';

// Shared Types
import {
  CreateTicketDto,
  TicketPriority,
  ProjectMemberWithUser,
  Label,
  UserRole,
  User,
  ProjectSummary,
} from '@issue-tracker/shared-types';

interface CreateTicketDialogData {
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'app-create-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-ticket-dialog.html',
  styleUrl: './create-ticket-dialog.scss',
})
export class CreateTicketDialog implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private ticketsService = inject(TicketsService);
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);

  ticketForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    description: new FormControl('', [Validators.required]),
    projectId: new FormControl('', [Validators.required]),
    priority: new FormControl<TicketPriority>(TicketPriority.MEDIUM),
    assigneeId: new FormControl<string | null>(null),
    labelIds: new FormControl<string[]>([]),
  });

  currentUser: User | null = null;
  isReporter = false;
  isDeveloper = false;
  isManager = false;
  isAdmin = false;

  isSubmitting = false;
  isLoadingProjects = false;
  isLoadingMembers = false;
  isLoadingLabels = false;

  projects: ProjectSummary[] = [];
  members: ProjectMemberWithUser[] = [];
  labels: Label[] = [];

  priorityOptions = [
    { value: TicketPriority.LOW, label: 'Niedrig' },
    { value: TicketPriority.MEDIUM, label: 'Mittel' },
    { value: TicketPriority.HIGH, label: 'Hoch' },
    { value: TicketPriority.CRITICAL, label: 'Kritisch' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CreateTicketDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateTicketDialogData
  ) {}

  ngOnInit(): void {
    // Current User laden
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.isReporter = this.currentUser.role === UserRole.REPORTER;
      this.isDeveloper = this.currentUser.role === UserRole.DEVELOPER;
      this.isManager = this.currentUser.role === UserRole.MANAGER;
      this.isAdmin = this.currentUser.role === UserRole.ADMIN;
    }

    // Projekt vorauswählen
    this.ticketForm.patchValue({ projectId: this.data.projectId });

    // Felder je nach Rolle deaktivieren
    if (this.isReporter) {
      // Reporter kann nur title und description setzen
      this.ticketForm.get('priority')?.disable();
      this.ticketForm.get('assigneeId')?.disable();
    }

    // Daten laden
    this.loadProjects();
    this.loadMembersForProject(this.data.projectId);
    this.loadLabelsForProject(this.data.projectId);

    // Bei Projekt-Wechsel: Members und Labels neu laden
    this.ticketForm
      .get('projectId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((projectId) => {
        if (projectId) {
          this.loadMembersForProject(projectId);
          this.loadLabelsForProject(projectId);
          // Assignee und Labels zurücksetzen
          this.ticketForm.patchValue({ assigneeId: null, labelIds: [] });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.isLoadingProjects = true;
    this.projectsService
      .findAllByRole()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.isLoadingProjects = false;
        },
        error: (err: Error) => {
          console.error('Error loading projects:', err);
          this.isLoadingProjects = false;
        },
      });
  }

  loadMembersForProject(projectId: string): void {
    this.isLoadingMembers = true;
    this.members = [];

    this.projectsService
      .findProjectMembers(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
          this.isLoadingMembers = false;
        },
        error: (err: Error) => {
          console.error('Error loading members:', err);
          this.isLoadingMembers = false;
        },
      });
  }

  loadLabelsForProject(projectId: string): void {
    this.isLoadingLabels = true;
    this.labels = [];

    this.projectsService
      .findProjectLabels(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (labels) => {
          this.labels = labels;
          this.isLoadingLabels = false;
        },
        error: (err: Error) => {
          console.error('Error loading labels:', err);
          this.isLoadingLabels = false;
        },
      });
  }

  canAssignToOthers(): boolean {
    return this.isManager || this.isAdmin;
  }

  canSetPriority(): boolean {
    return !this.isReporter;
  }

  onSubmit(): void {
    if (this.ticketForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.ticketForm.getRawValue();
    const projectId = formValue.projectId || this.data.projectId;

    // DTO vorbereiten
    const createTicketDto: CreateTicketDto = {
      title: formValue.title || '',
      description: formValue.description || '',
    };

    // Optional fields nur hinzufügen wenn berechtigt und gesetzt
    if (!this.isReporter && formValue.priority) {
      createTicketDto.priority = formValue.priority;
    }

    if (formValue.assigneeId) {
      // Developer darf nur sich selbst zuweisen
      if (
        this.isDeveloper &&
        this.currentUser &&
        formValue.assigneeId === this.currentUser.id
      ) {
        createTicketDto.assigneeId = formValue.assigneeId;
      } else if (this.canAssignToOthers()) {
        createTicketDto.assigneeId = formValue.assigneeId;
      }
    }

    if (formValue.labelIds && formValue.labelIds.length > 0) {
      createTicketDto.labelIds = formValue.labelIds;
    }

    this.ticketsService
      .createTicket(projectId, createTicketDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticket) => {
          this.dialogRef.close(ticket);
        },
        error: (err: Error) => {
          console.error('Error creating ticket:', err);
          this.isSubmitting = false;
          // TODO: Error-Handling mit Snackbar
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getAssigneeOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];

    if (this.isDeveloper && this.currentUser) {
      // Developer sieht nur sich selbst
      options.push({
        value: this.currentUser.id,
        label: `${this.currentUser.name} ${this.currentUser.surname} (Ich)`,
      });
    } else if (this.canAssignToOthers()) {
      // Manager/Admin sehen alle Projektmitglieder
      this.members
        .filter((member) => member.user)
        .forEach((member) => {
          options.push({
            value: member.user!.id,
            label: `${member.user!.name} ${member.user!.surname}`,
          });
        });
    }

    return options;
  }
}
