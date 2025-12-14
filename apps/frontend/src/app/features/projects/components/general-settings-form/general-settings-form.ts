// apps/frontend/src/app/features/projects/components/general-settings-form/general-settings-form.ts
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ProjectSummary, UserRole } from '@issue-tracker/shared-types';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-general-settings-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './general-settings-form.html',
  styleUrl: './general-settings-form.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GeneralSettingsForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  @Input() project!: ProjectSummary;
  @Output() closeForm = new EventEmitter<void>();
  @Output() saveForm = new EventEmitter<any>();
  @Output() deleteProject = new EventEmitter<string>();

  settingsForm!: FormGroup;
  isAdmin = false;
  canEdit = false;

  ngOnInit(): void {
    // Check if user is admin or manager
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === UserRole.ADMIN;
    this.canEdit =
      currentUser?.role === UserRole.ADMIN ||
      currentUser?.role === UserRole.MANAGER;

    // Initialize form
    this.settingsForm = this.fb.group({
      name: [
        { value: this.project.name, disabled: !this.canEdit },
        [Validators.required, Validators.minLength(3)],
      ],
      description: [
        { value: this.project.description, disabled: !this.canEdit },
        [Validators.required],
      ],
      slug: [
        { value: this.project.slug, disabled: !this.isAdmin },
        [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)],
      ],
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      const formValue = this.settingsForm.getRawValue(); // getRawValue() includes disabled fields
      this.saveForm.emit(formValue);
    }
  }

  onClose(): void {
    this.closeForm.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onDelete(): void {
    const confirmed = confirm(
      `Möchten Sie das Projekt "${this.project.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );
    if (confirmed) {
      this.deleteProject.emit(this.project.id);
    }
  }

  getFormattedDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
