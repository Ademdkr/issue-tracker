import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';
import { Comment, Ticket } from '@prisma/client';

/**
 * Policy: Kommentar aktualisieren
 *
 * Erlaubt:
 * - Reporter: Nur eigene Kommentare
 * - Developer: Nur eigene Kommentare, wenn Creator oder Assignee des Tickets
 * - Manager: Alle Kommentare
 * - Admin: Alle Kommentare
 */
@Injectable()
export class UpdateCommentPolicyHandler
  implements PolicyHandler<Comment & { ticket?: Ticket }>
{
  async handle(
    user: User,
    comment: Comment & { ticket?: Ticket }
  ): Promise<boolean> {
    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isDeveloper = user.role === UserRole.DEVELOPER;
    const isReporter = user.role === UserRole.REPORTER;

    // Admin und Manager: Alles erlaubt
    if (isAdmin || isManager) {
      return true;
    }

    // Developer: Kann eigene Kommentare bearbeiten, wenn Creator oder Assignee des Tickets
    if (isDeveloper) {
      if (comment.authorId !== user.id) {
        return false; // Nicht der Autor des Kommentars
      }

      // Prüfe ob Developer Creator oder Assignee des Tickets ist
      if (comment.ticket) {
        return (
          comment.ticket.reporterId === user.id ||
          comment.ticket.assigneeId === user.id
        );
      }

      return false;
    }

    // Reporter: Kann nur eigene Kommentare bearbeiten
    if (isReporter) {
      return comment.authorId === user.id;
    }

    return false;
  }
}
