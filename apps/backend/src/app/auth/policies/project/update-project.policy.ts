import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, UserRole } from '@issue-tracker/shared-types';

/**
 * Policy für Projekt-Updates
 *
 * Regeln:
 * - Admin: Kann alle Projekte bearbeiten
 * - Manager: Kann alle Projekte bearbeiten
 * - Developer: Keine Berechtigung
 * - Reporter: Keine Berechtigung
 */
@Injectable()
export class UpdateProjectPolicyHandler extends PolicyHandler<unknown> {
  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Projekte bearbeiten
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }
}
