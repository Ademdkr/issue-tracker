import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services
import { CommentsService } from '../../../../../core/services/comments.service';
import { AuthService } from '../../../../../core/services/auth.service';

// Types
import {
  CommentWithAuthor,
  TicketWithDetails,
  UserRole,
  VALIDATION_LIMITS,
} from '@issue-tracker/shared-types';

// Components
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-ticket-comments-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './ticket-comments-tab.html',
  styleUrl: './ticket-comments-tab.scss',
})
export class TicketCommentsTab implements OnInit, OnDestroy {
  @Input() ticket!: TicketWithDetails;
  @Input() projectId!: string;

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private commentsService = inject(CommentsService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  comments: CommentWithAuthor[] = [];
  currentUser = this.authService.getCurrentUser() ?? {
    id: '',
    email: '',
    name: '',
    surname: '',
    role: UserRole.REPORTER,
  };
  commentForm!: FormGroup;
  editingCommentId: string | null = null;
  isLoading = false;
  isSending = false;

  readonly maxLength = VALIDATION_LIMITS.COMMENT_CONTENT_MAX;

  ngOnInit(): void {
    this.initForm();
    this.loadComments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.commentForm = this.fb.group({
      content: [
        '',
        [Validators.required, Validators.maxLength(this.maxLength)],
      ],
    });
  }

  loadComments(): void {
    this.isLoading = true;
    this.commentsService
      .findAll(this.projectId, this.ticket.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.comments = comments.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading comments:', err);
          this.snackBar.open('Fehler beim Laden der Kommentare', 'Schließen', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.isLoading = false;
        },
      });
  }

  onSubmit(): void {
    if (this.commentForm.invalid || this.isSending) return;

    const content = this.commentForm.value.content.trim();
    if (!content) return;

    this.isSending = true;

    if (this.editingCommentId) {
      // Update existing comment
      this.commentsService
        .update(this.projectId, this.ticket.id, this.editingCommentId, {
          content,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedComment) => {
            const index = this.comments.findIndex(
              (c) => c.id === this.editingCommentId
            );
            if (index !== -1) {
              this.comments[index] = updatedComment;
            }
            this.snackBar.open(
              'Kommentar erfolgreich aktualisiert',
              'Schließen',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            this.cancelEdit();
          },
          error: (err) => {
            console.error('Error updating comment:', err);
            this.snackBar.open(
              'Fehler beim Aktualisieren des Kommentars',
              'Schließen',
              {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            this.isSending = false;
          },
        });
    } else {
      // Create new comment
      this.commentsService
        .create(this.projectId, this.ticket.id, { content })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newComment) => {
            this.comments.unshift(newComment);
            this.snackBar.open(
              'Kommentar erfolgreich hinzugefügt',
              'Schließen',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            this.commentForm.reset();
            Object.keys(this.commentForm.controls).forEach((key) => {
              this.commentForm.get(key)?.setErrors(null);
            });
            this.isSending = false;
          },
          error: (err) => {
            console.error('Error creating comment:', err);
            this.snackBar.open(
              'Fehler beim Erstellen des Kommentars',
              'Schließen',
              {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            this.isSending = false;
          },
        });
    }
  }

  startEdit(comment: CommentWithAuthor): void {
    this.editingCommentId = comment.id;
    this.commentForm.patchValue({
      content: comment.content,
    });
    // Scroll to form
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.commentForm.reset();
    this.isSending = false;
  }

  deleteComment(comment: CommentWithAuthor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Kommentar löschen',
        message: 'Möchten Sie diesen Kommentar wirklich löschen?',
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.commentsService
          .delete(this.projectId, this.ticket.id, comment.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.comments = this.comments.filter((c) => c.id !== comment.id);
              this.snackBar.open(
                'Kommentar erfolgreich gelöscht',
                'Schließen',
                {
                  duration: 3000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                }
              );
            },
            error: (err) => {
              console.error('Error deleting comment:', err);
              this.snackBar.open(
                'Fehler beim Löschen des Kommentars',
                'Schließen',
                {
                  duration: 5000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                }
              );
            },
          });
      }
    });
  }

  canEditComment(comment: CommentWithAuthor): boolean {
    const isAuthor = comment.authorId === this.currentUser.id;

    // Nur eigene Kommentare können bearbeitet werden
    return isAuthor;
  }

  canDeleteComment(comment: CommentWithAuthor): boolean {
    const role = this.currentUser.role;
    const isAuthor = comment.authorId === this.currentUser.id;
    const isManagerOrAdmin =
      role === UserRole.MANAGER || role === UserRole.ADMIN;

    // Eigene Kommentare können alle löschen, Manager/Admin können fremde löschen
    return isAuthor || isManagerOrAdmin;
  }

  canComment(): boolean {
    const role = this.currentUser.role;
    const isReporter = role === UserRole.REPORTER;
    const isDeveloper = role === UserRole.DEVELOPER;
    const isManagerOrAdmin =
      role === UserRole.MANAGER || role === UserRole.ADMIN;

    // Manager und Admin können immer kommentieren
    if (isManagerOrAdmin) return true;

    // Reporter können nur eigene Tickets kommentieren
    if (isReporter) {
      return this.ticket.reporterId === this.currentUser.id;
    }

    // Developer können eigene oder zugewiesene Tickets kommentieren
    if (isDeveloper) {
      return (
        this.ticket.reporterId === this.currentUser.id ||
        this.ticket.assigneeId === this.currentUser.id
      );
    }

    return false;
  }

  isOwnComment(comment: CommentWithAuthor): boolean {
    return comment.authorId === this.currentUser.id;
  }

  getAuthorName(comment: CommentWithAuthor): string {
    if (!comment.author) return 'Unbekannt';
    return `${comment.author.name} ${comment.author.surname}`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
