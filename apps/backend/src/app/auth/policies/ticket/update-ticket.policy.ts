import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole, Ticket } from '@issue-tracker/shared-types';

/**
 * Policy: Wer darf Tickets updaten?
 *
 * Rules für generelle Updates:
 * - Admin/Manager: Alle Tickets
 * - Developer: Eigene oder zugewiesene Tickets
 * - Reporter: Nur eigene Tickets
 *
 * Spezielle Regeln:
 * - Priority setzen: Admin/Manager/Developer (bei eigenen/zugewiesenen)
 * - Status setzen: Admin/Manager/Developer (bei eigenen/zugewiesenen), aber Developer kann nicht auf "closed" setzen
 * - Assignee setzen: Admin/Manager beliebig, Developer nur sich selbst
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

  /**
   * Prüft ob User Priority setzen darf
   */
  canSetPriority(user: User, ticket: Ticket): boolean {
    // Reporter: Niemals
    if (user.role === UserRole.REPORTER) {
      return false;
    }

    // Admin/Manager: Immer
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // Developer: Bei eigenen oder zugewiesenen
    return ticket.reporterId === user.id || ticket.assigneeId === user.id;
  }

  /**
   * Prüft ob User Status setzen darf
   */
  canSetStatus(user: User, ticket: Ticket): boolean {
    // Reporter: Niemals
    if (user.role === UserRole.REPORTER) {
      return false;
    }

    // Admin/Manager: Immer
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // Developer: Bei eigenen oder zugewiesenen
    return ticket.reporterId === user.id || ticket.assigneeId === user.id;
  }

  /**
   * Prüft ob User Assignee setzen darf
   * @param assigneeId - Die neue Assignee-ID (null = entfernen)
   */
  canAssign(user: User, ticket: Ticket, assigneeId: string | null): boolean {
    // Admin/Manager: Immer erlaubt
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    // null assigneeId ist erlaubt (Zuweisung entfernen)
    if (assigneeId === null) {
      // Developer kann Zuweisung von sich selbst entfernen
      if (user.role === UserRole.DEVELOPER) {
        return ticket.assigneeId === user.id;
      }
      return false;
    }

    // Developer: Nur sich selbst
    if (user.role === UserRole.DEVELOPER) {
      return assigneeId === user.id;
    }

    // Reporter: Nicht erlaubt
    return false;
  }
}
