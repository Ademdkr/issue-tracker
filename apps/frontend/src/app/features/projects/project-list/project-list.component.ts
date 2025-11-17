import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Placeholder Component für Projektliste
 *
 * Wird später implementiert.
 */
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px;">
      <h1>Projektliste</h1>
      <p>Sie sind erfolgreich eingeloggt!</p>
      <p>Diese Seite wird später mit der Projektliste gefüllt.</p>
    </div>
  `,
})
export class ProjectListComponent {}
