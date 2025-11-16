import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';

/**
 * Policy für Label-Erstellung
 *
 * Regeln:
 * - Admin: Kann Labels erstellen
 * - Manager: Kann Labels erstellen
 * - Developer: Keine Berechtigung
 * - Reporter: Keine Berechtigung
 */
@Injectable()
export class CreateLabelPolicyHandler extends PolicyHandler<unknown> {
  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Labels erstellen
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }
}
