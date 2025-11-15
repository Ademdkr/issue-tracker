import { Injectable } from '@nestjs/common';
import { PolicyHandler } from '../policy-handler.interface';
import { User, Label, Permission } from '@issue-tracker/shared-types';
import { AuthorizationService } from '../../services/authorization.service';

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
export class DeleteLabelPolicyHandler extends PolicyHandler<Label> {
  constructor(private readonly authService: AuthorizationService) {
    super();
  }

  async handle(user: User): Promise<boolean> {
    // Admin und Manager dürfen Labels löschen
    return this.authService.hasPermission(user, Permission.DELETE_LABEL);
  }
}
