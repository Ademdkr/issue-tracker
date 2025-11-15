import { Injectable } from '@nestjs/common';
import { PolicyHandler } from './policy-handler.interface';
import { User, Project, Permission } from '@issue-tracker/shared-types';
import { AuthorizationService } from '../services/authorization.service';

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
export class UpdateProjectPolicyHandler extends PolicyHandler<Project> {
  constructor(private readonly authService: AuthorizationService) {
    super();
  }

  async handle(user: User, project?: Project): Promise<boolean> {
    // Admin und Manager dürfen Projekte bearbeiten
    return this.authService.hasPermission(user, Permission.UPDATE_PROJECT);
  }
}
