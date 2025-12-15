import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole, Ticket } from '@issue-tracker/shared-types';

/**
 * Policy: Kommentar erstellen
 *
 * Erlaubt:
 * - Reporter: Nur auf selbst erstellte Tickets
 * - Developer: Nur auf selbst erstellte oder zugewiesene Tickets
 * - Manager: Alle Tickets
 * - Admin: Alle Tickets
 */
@Injectable()
export class CreateCommentPolicyHandler extends PolicyHandler<Ticket> {
  handle(user: User, ticket: Ticket): boolean {
    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isDeveloper = user.role === UserRole.DEVELOPER;
    const isReporter = user.role === UserRole.REPORTER;

    // Admin und Manager: Können auf alle Tickets kommentieren
    if (isAdmin || isManager) {
      return true;
    }

    // Developer: Kann auf eigene oder zugewiesene Tickets kommentieren
    if (isDeveloper) {
      return ticket.reporterId === user.id || ticket.assigneeId === user.id;
    }

    // Reporter: Kann nur auf eigene Tickets kommentieren
    if (isReporter) {
      return ticket.reporterId === user.id;
    }

    return false;
  }
}
