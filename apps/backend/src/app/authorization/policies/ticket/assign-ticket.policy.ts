import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole, Ticket } from '@issue-tracker/shared-types';

/**
 * Policy: Wer darf Tickets zuweisen?
 *
 * Rules:
 * - Admin/Manager: Können beliebige User zuweisen
 * - Developer: Können nur sich selbst zuweisen
 * - Reporter: Können nicht zuweisen
 */
@Injectable()
export class AssignTicketPolicyHandler extends PolicyHandler<{
  ticket: Ticket;
  assigneeId: string | null;
}> {
  handle(
    user: User,
    context: { ticket: Ticket; assigneeId: string | null }
  ): boolean {
    // Admin/Manager: Immer erlaubt
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // null assigneeId ist erlaubt (Zuweisung entfernen)
    if (context.assigneeId === null) {
      // Developer kann Zuweisung von sich selbst entfernen
      if (user.role === UserRole.DEVELOPER) {
        return context.ticket.assigneeId === user.id;
      }
      return false;
    }

    // Developer: Nur sich selbst
    if (user.role === UserRole.DEVELOPER) {
      return context.assigneeId === user.id;
    }

    // Reporter: Nicht erlaubt
    return false;
  }
}
