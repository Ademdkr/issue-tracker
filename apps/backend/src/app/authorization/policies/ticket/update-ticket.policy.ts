import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole, Ticket } from '@issue-tracker/shared-types';

/**
 * Policy: Wer darf Tickets updaten?
 *
 * Rules:
 * - Admin/Manager: Alle Tickets
 * - Developer: Eigene oder zugewiesene Tickets
 * - Reporter: Nur eigene Tickets
 */
@Injectable()
export class UpdateTicketPolicyHandler extends PolicyHandler<Ticket> {
  handle(user: User, ticket: Ticket): boolean {
    // Admin/Manager: Immer erlaubt
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // Developer: Eigene oder zugewiesene
    if (user.role === UserRole.DEVELOPER) {
      return ticket.reporterId === user.id || ticket.assigneeId === user.id;
    }

    // Reporter: Nur eigene
    if (user.role === UserRole.REPORTER) {
      return ticket.reporterId === user.id;
    }

    return false;
  }
}
