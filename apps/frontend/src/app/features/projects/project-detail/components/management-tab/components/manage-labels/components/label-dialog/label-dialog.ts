import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Label } from '@issue-tracker/shared-types';
import { ProjectsService } from 'apps/frontend/src/app/core/services/projects.service';

interface DialogData {
  projectId: string;
  label?: Label;
}

@Component({
  selector: 'app-label-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './label-dialog.html',
  styleUrl: './label-dialog.scss',
})
export class LabelDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly dialogRef = inject(MatDialogRef<LabelDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  labelForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  predefinedColors = [
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#673ab7', // Deep Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#03a9f4', // Light Blue
    '#00bcd4', // Cyan
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffeb3b', // Yellow
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
  ];

  ngOnInit(): void {
    this.isEditMode = !!this.data.label;

    this.labelForm = this.fb.group({
      name: [
        this.data.label?.name || '',
        [Validators.required, Validators.maxLength(50)],
      ],
      color: [
        this.data.label?.color || this.predefinedColors[0],
        [Validators.required],
      ],
    });
  }

  get title(): string {
    return this.isEditMode ? 'Label bearbeiten' : 'Neues Label erstellen';
  }

  onColorSelect(color: string): void {
    this.labelForm.patchValue({ color });
  }

  onSubmit(): void {
    if (this.labelForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = {
      ...this.labelForm.value,
      name: this.labelForm.value.name.toLowerCase().trim(), // Zu Lowercase konvertieren
    };

    const request = this.isEditMode
      ? this.projectsService.updateLabel(
          this.data.projectId,
          this.data.label!.id,
          formValue
        )
      : this.projectsService.createLabel(this.data.projectId, formValue);

    request.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving label:', error);
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
