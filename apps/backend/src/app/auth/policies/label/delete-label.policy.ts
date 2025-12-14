import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';

/**
 * Policy für Label-Löschung
 *
 * Regeln:
 * - Admin: Kann alle Labels löschen
 * - Manager: Kann alle Labels löschen
 * - Developer: Keine Berechtigung
 * - Reporter: Keine Berechtigung
 */
@Injectable()
export class DeleteLabelPolicyHandler extends PolicyHandler<unknown> {
  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Labels löschen
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }
}
