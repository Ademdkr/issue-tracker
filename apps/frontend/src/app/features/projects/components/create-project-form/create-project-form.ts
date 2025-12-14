import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-create-project-form',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './create-project-form.html',
  styleUrl: './create-project-form.scss',
})
export class CreateProjectForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  @Output() closeForm = new EventEmitter<void>();
  @Output() createProject = new EventEmitter<{
    name: string;
    description: string;
  }>();

  createProjectForm!: FormGroup;
  generatedKey = '';
  currentUserName = '';
  currentDate = new Date();

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserName = currentUser
      ? `${currentUser.name} ${currentUser.surname}`
      : 'Unbekannt';

    this.createProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
    });

    // Auto-generate key from name
    this.createProjectForm
      .get('name')
      ?.valueChanges.subscribe((name: string) => {
        if (name) {
          this.generatedKey = this.generateKey(name);
        } else {
          this.generatedKey = '';
        }
      });
  }

  private generateKey(name: string): string {
    // Liste bekannter Begriffe (synchronisiert mit Backend)
    const knownTerms = [
      'portal',
      'crm',
      'shop',
      'app',
      'system',
      'tool',
      'platform',
      'dashboard',
      'api',
      'web',
      'mobile',
      'admin',
      'manager',
      'tracker',
      'monitor',
      'analytics',
      'cms',
      'erp',
      'hr',
      'pos',
      'blog',
      'forum',
      'chat',
      'mail',
      'calendar',
      'todo',
      'task',
      'project',
    ];

    // Normalisieren und in Wörter aufteilen
    const words = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/[-\s]+/)
      .filter((word) => word.length > 0);

    // Fallback wenn keine gültigen Wörter
    if (words.length === 0) {
      return 'PROJECT';
    }

    // Letztes Wort prüfen
    const lastWord = words[words.length - 1];

    // Bekannter Begriff als letztes Wort?
    if (knownTerms.includes(lastWord)) {
      return lastWord.toUpperCase();
    }

    // Nur ein Wort? → Erste 5 Zeichen
    if (words.length === 1) {
      return words[0].substring(0, 5).toUpperCase();
    }

    // Mehrere Wörter → Akronym
    return words
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  onSubmit(): void {
    if (this.createProjectForm.valid) {
      this.createProject.emit(this.createProjectForm.value);
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

  getFormattedDate(): string {
    return this.currentDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
