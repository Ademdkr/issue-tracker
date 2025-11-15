import { Injectable } from '@nestjs/common';
import { PolicyHandler } from './policy-handler.interface';
import { User, Label, Permission } from '@issue-tracker/shared-types';
import { AuthorizationService } from '../services/authorization.service';

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
export class UpdateLabelPolicyHandler extends PolicyHandler<Label> {
  constructor(private readonly authService: AuthorizationService) {
    super();
  }

  async handle(user: User, label?: Label): Promise<boolean> {
    // Admin und Manager dürfen Labels bearbeiten
    return this.authService.hasPermission(user, Permission.UPDATE_LABEL);
  }
}
