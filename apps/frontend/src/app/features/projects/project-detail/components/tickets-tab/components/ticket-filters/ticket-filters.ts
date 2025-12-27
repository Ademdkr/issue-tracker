// Angular Modules
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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// RxJS
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

// Services
import { ProjectsService } from '../../../../../../../core/services/projects.service';
import { ErrorService } from '../../../../../../../core/services/error.service';

// Shared Types
import {
  TicketFilters as TicketFiltersType,
  ProjectMemberWithUser,
  Label,
  LabelWithProject,
  GroupedLabel,
} from '@issue-tracker/shared-types';

@Component({
  selector: 'app-ticket-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './ticket-filters.html',
  styleUrl: './ticket-filters.scss',
})
export class TicketFilters implements OnInit, OnDestroy {
  @Input() projectId?: string;
  @Output() filtersChange = new EventEmitter<TicketFiltersType>();

  private destroy$ = new Subject<void>();

  filterForm = new FormGroup({
    status: new FormControl(''),
    priority: new FormControl(''),
    assigneeId: new FormControl(''),
    labelIds: new FormControl<string[]>([]),
    search: new FormControl(''),
  });

  statusOptions = [
    { value: '', label: 'Alle Status' },
    { value: 'OPEN', label: 'Offen' },
    { value: 'IN_PROGRESS', label: 'In Bearbeitung' },
    { value: 'RESOLVED', label: 'Gelöst' },
    { value: 'CLOSED', label: 'Geschlossen' },
  ];

  priorityOptions = [
    { value: '', label: 'Alle Prioritäten' },
    { value: 'LOW', label: 'Niedrig' },
    { value: 'MEDIUM', label: 'Mittel' },
    { value: 'HIGH', label: 'Hoch' },
    { value: 'CRITICAL', label: 'Kritisch' },
  ];

  assigneeOptions: { value: string; label: string }[] = [
    { value: '', label: 'Alle Assignees' },
  ];

  labels: LabelWithProject[] = [];
  groupedLabels: GroupedLabel[] = [];

  private projectsService = inject(ProjectsService);

  constructor() {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.emitFilters());
  }

  ngOnInit(): void {
    this.loadAssignees();
    this.loadLabels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssignees(): void {
    if (!this.projectId) return;

    this.projectsService
      .findProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members: ProjectMemberWithUser[]) => {
          this.assigneeOptions = [
            { value: '', label: 'Alle Zuständigen' },
            ...members
              .filter((member) => member.user)
              .map((member) => ({
                value: member.user!.id,
                label: `${member.user!.name} ${member.user!.surname}`,
              })),
          ];
        },
        error: (err: Error) => {
          inject(ErrorService).handleHttpError(
            err,
            'Fehler beim Laden der Zuständigen'
          );
        },
      });
  }

  loadLabels(): void {
    // Wenn keine projectId vorhanden ist (z.B. auf /tickets-Seite), lade alle Labels
    if (!this.projectId) {
      this.projectsService
        .findAllLabelsForUser()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (labels: LabelWithProject[]) => {
            this.labels = labels;
            this.groupLabels(labels);
          },
          error: (err: Error) => {
            inject(ErrorService).handleHttpError(
              err,
              'Fehler beim Laden aller Labels'
            );
          },
        });
      return;
    }

    // Sonst lade nur Labels des spezifischen Projekts
    this.projectsService
      .findProjectLabels(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (labels: Label[]) => {
          this.labels = labels;
          this.groupedLabels = labels.map((label) => ({
            name: label.name,
            color: label.color,
            ids: [label.id],
          }));
        },
        error: (err: Error) => {
          inject(ErrorService).handleHttpError(
            err,
            'Fehler beim Laden der Labels'
          );
        },
      });
  }

  private groupLabels(labels: LabelWithProject[]): void {
    const labelMap = new Map<string, GroupedLabel>();

    labels.forEach((label) => {
      const existing = labelMap.get(label.name);
      if (existing) {
        existing.ids.push(label.id);
        if (
          label.project?.slug &&
          !existing.projectSlugs?.includes(label.project.slug)
        ) {
          existing.projectSlugs?.push(label.project.slug);
        }
      } else {
        labelMap.set(label.name, {
          name: label.name,
          color: label.color,
          ids: [label.id],
          projectSlugs: label.project ? [label.project.slug] : undefined,
        });
      }
    });

    this.groupedLabels = Array.from(labelMap.values());
  }

  emitFilters(): void {
    const formValue = this.filterForm.value;

    // Expandiere ausgewählte Label-Namen zu allen zugehörigen IDs
    let expandedLabelIds: string[] | undefined = undefined;
    if (formValue.labelIds && formValue.labelIds.length > 0) {
      expandedLabelIds = [];
      formValue.labelIds.forEach((selectedName: string) => {
        const grouped = this.groupedLabels.find((g) => g.name === selectedName);
        if (grouped) {
          expandedLabelIds!.push(...grouped.ids);
        }
      });
      if (expandedLabelIds.length === 0) {
        expandedLabelIds = undefined;
      }
    }

    const filters: TicketFiltersType = {
      status: formValue.status || undefined,
      priority: formValue.priority || undefined,
      assigneeId: formValue.assigneeId || undefined,
      labelIds: expandedLabelIds,
      search: formValue.search || undefined,
    };

    // Nur Felder mit Werten senden
    const cleanedFilters: TicketFiltersType = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedFilters[key as keyof TicketFiltersType] = value;
      }
    });

    this.filtersChange.emit(cleanedFilters);
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      priority: '',
      assigneeId: '',
      labelIds: [],
      search: '',
    });
  }
}
