import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole, Ticket } from '@issue-tracker/shared-types';

/**
 * Policy: Wer darf Ticket-Priorität setzen?
 *
 * Rules:
 * - Admin/Manager: Immer
 * - Developer: Bei eigenen oder zugewiesenen Tickets
 * - Reporter: Niemals
 */
@Injectable()
export class SetTicketPriorityPolicyHandler extends PolicyHandler<Ticket> {
  handle(user: User, ticket: Ticket): boolean {
    // Admin/Manager: Immer
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // Developer: Bei eigenen oder zugewiesenen
    if (user.role === UserRole.DEVELOPER) {
      return ticket.reporterId === user.id || ticket.assigneeId === user.id;
    }

    // Reporter: Niemals
    return false;
  }
}
