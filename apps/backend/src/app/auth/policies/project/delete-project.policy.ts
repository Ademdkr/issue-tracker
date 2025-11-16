import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';

/**
 * Policy für Projekt-Löschung
 *
 * Regeln:
 * - Admin: Kann alle Projekte löschen
 * - Manager: Keine Berechtigung
 * - Developer: Keine Berechtigung
 * - Reporter: Keine Berechtigung
 */
@Injectable()
export class DeleteProjectPolicyHandler extends PolicyHandler<unknown> {
  async handle(user: User): Promise<boolean> {
    // Nur Admin darf Projekte löschen
    return user.role === UserRole.ADMIN;
  }
}
