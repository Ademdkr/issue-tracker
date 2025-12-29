import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { Label } from '@issue-tracker/shared-types';
import { ProjectsService } from 'apps/frontend/src/app/core/services/projects.service';
import { ErrorService } from 'apps/frontend/src/app/core/services/error.service';
import { LabelDialogComponent } from './components/label-dialog/label-dialog';

@Component({
  selector: 'app-manage-labels',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './manage-labels.html',
  styleUrl: './manage-labels.scss',
})
export class ManageLabels implements OnInit {
  @Input() projectId!: string;

  labels: Label[] = [];
  isLoading = false;

  private dialog = inject(MatDialog);
  private projectsService = inject(ProjectsService);

  ngOnInit(): void {
    this.loadLabels();
  }

  loadLabels(): void {
    if (!this.projectId) return;

    this.isLoading = true;
    this.projectsService.findProjectLabels(this.projectId).subscribe({
      next: (labels) => {
        this.labels = labels;
        this.isLoading = false;
      },
      error: (error) => {
        inject(ErrorService).handleHttpError(
          error,
          'Fehler beim Laden der Labels'
        );
        this.isLoading = false;
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: '400px',
      data: { projectId: this.projectId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadLabels();
      }
    });
  }

  openEditDialog(label: Label): void {
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: '400px',
      data: { projectId: this.projectId, label },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadLabels();
      }
    });
  }

  deleteLabel(label: Label): void {
    if (!confirm(`Label "${label.name}" wirklich löschen?`)) {
      return;
    }

    this.projectsService.deleteLabel(this.projectId, label.id).subscribe({
      next: () => {
        this.loadLabels();
      },
      error: (error) => {
        inject(ErrorService).handleHttpError(
          error,
          'Fehler beim Löschen des Labels'
        );
      },
    });
  }
}
