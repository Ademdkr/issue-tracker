import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VALIDATION_LIMITS } from '../constants';

/**
 * DTO für Kommentar-Erstellung
 *
 * projectId und ticketId kommen aus den Route-Parametern:
 * POST /api/projects/:projectId/tickets/:ticketId/comments
 *
 * authorId wird automatisch aus dem angemeldeten User gesetzt
 *
 * Berechtigungen:
 * - Reporter: Kann Kommentare erstellen, wenn Teil des Projekts
 * - Developer: Kann Kommentare erstellen, wenn Teil des Projekts
 * - Manager/Admin: Können immer Kommentare erstellen
 */
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.COMMENT_CONTENT_MAX)
  content: string;
}

/**
 * DTO für Kommentar-Aktualisierung
 *
 * Berechtigungen:
 * - Reporter: Kann nur eigene Kommentare bearbeiten
 * - Developer: Kann eigene Kommentare bearbeiten, wenn Creator oder Assignee des Tickets
 * - Manager/Admin: Können alle Kommentare bearbeiten
 */
export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.COMMENT_CONTENT_MAX)
  content: string;
}
