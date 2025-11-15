import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, Project, Permission } from '@issue-tracker/shared-types';
import { AuthorizationService } from '../../services/authorization.service';

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
export class ManageProjectMembersPolicyHandler extends PolicyHandler<Project> {
  constructor(private readonly authService: AuthorizationService) {
    super();
  }

  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Mitglieder verwalten
    return this.authService.hasPermission(
      user,
      Permission.MANAGE_PROJECT_MEMBERS
    );
  }
}
