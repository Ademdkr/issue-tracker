import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';

/**
 * Policy für Label-Updates
 *
 * Regeln:
 * - Admin: Kann alle Labels bearbeiten
 * - Manager: Kann alle Labels bearbeiten
 * - Developer: Keine Berechtigung
 * - Reporter: Keine Berechtigung
 */
@Injectable()
export class UpdateLabelPolicyHandler extends PolicyHandler<unknown> {
  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Labels bearbeiten
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }
}
