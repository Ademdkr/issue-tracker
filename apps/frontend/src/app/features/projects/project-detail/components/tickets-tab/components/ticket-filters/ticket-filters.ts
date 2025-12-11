// Angular Modules
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// RxJS
import { debounceTime } from 'rxjs/operators';

// Shared Types
import { TicketFilters as TicketFiltersType } from '@issue-tracker/shared-types';

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
export class TicketFilters {
  @Output() filtersChange = new EventEmitter<TicketFiltersType>();

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

  // TODO: Assignees und Labels dynamisch vom Backend laden
  assigneeOptions = [{ value: '', label: 'Alle Zuständigen' }];

  labelOptions: { value: string; label: string }[] = [];

  constructor() {
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.emitFilters());
  }

  emitFilters(): void {
    const formValue = this.filterForm.value;

    const filters: TicketFiltersType = {
      status: formValue.status || undefined,
      priority: formValue.priority || undefined,
      assigneeId: formValue.assigneeId || undefined,
      labelIds:
        formValue.labelIds && formValue.labelIds.length > 0
          ? formValue.labelIds
          : undefined,
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
