import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';

/**
 * Policy für Projektmitglieder-Verwaltung
 *
 * Regeln:
 * - Admin: Kann Mitglieder verwalten
 * - Manager: Kann Mitglieder verwalten
 * - Developer: Keine Berechtigung
 * - Reporter: Keine Berechtigung
 */
@Injectable()
export class ManageProjectMembersPolicyHandler extends PolicyHandler<unknown> {
  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Mitglieder verwalten
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }
}
