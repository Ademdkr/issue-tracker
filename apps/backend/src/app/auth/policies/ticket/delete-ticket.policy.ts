import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole, Ticket } from '@issue-tracker/shared-types';

/**
 * Policy: Ticket löschen
 *
 * Erlaubt:
 * - Reporter: Nur eigene Tickets
 * - Developer: Eigene Tickets oder zugewiesene Tickets
 * - Manager: Alle Tickets
 * - Admin: Alle Tickets
 */
@Injectable()
export class DeleteTicketPolicyHandler implements PolicyHandler<Ticket> {
  async handle(user: User, ticket: Ticket): Promise<boolean> {
    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isDeveloper = user.role === UserRole.DEVELOPER;
    const isReporter = user.role === UserRole.REPORTER;

    // Admin und Manager: Alles erlaubt
    if (isAdmin || isManager) {
      return true;
    }

    // Developer: Kann eigene oder zugewiesene Tickets löschen
    if (isDeveloper) {
      return ticket.reporterId === user.id || ticket.assigneeId === user.id;
    }

    // Reporter: Kann nur eigene Tickets löschen
    if (isReporter) {
      return ticket.reporterId === user.id;
    }

    return false;
  }
}
