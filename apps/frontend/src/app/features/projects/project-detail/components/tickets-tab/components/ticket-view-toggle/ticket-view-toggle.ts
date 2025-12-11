// Angular Modules
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

// Material Modules
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ticket-view-toggle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './ticket-view-toggle.html',
  styleUrl: './ticket-view-toggle.scss',
})
export class TicketViewToggle {
  @Input() viewMode: 'list' | 'grid' = 'list';
  @Output() viewModeChange = new EventEmitter<'list' | 'grid'>();
  @Output() searchChange = new EventEmitter<string>();

  searchControl = new FormControl('');

  constructor() {
    // Emit search changes with debouncing
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.searchChange.emit(value || '');
      });
  }

  onViewModeChange(mode: 'list' | 'grid'): void {
    this.viewModeChange.emit(mode);
  }
}
