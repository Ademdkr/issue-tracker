import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, Project, Permission } from '@issue-tracker/shared-types';
import { AuthorizationService } from '../../services/authorization.service';

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
export class DeleteProjectPolicyHandler extends PolicyHandler<Project> {
  constructor(private readonly authService: AuthorizationService) {
    super();
  }

  async handle(user: User): Promise<boolean> {
    // Nur Admin darf Projekte löschen
    return this.authService.hasPermission(user, Permission.DELETE_PROJECT);
  }
}
