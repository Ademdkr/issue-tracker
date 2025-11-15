import { Injectable } from '@nestjs/common';
import { PolicyHandler } from './policy-handler.interface';
import { User, Label, Permission } from '@issue-tracker/shared-types';
import { AuthorizationService } from '../services/authorization.service';

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
export class CreateLabelPolicyHandler extends PolicyHandler<Label> {
  constructor(private readonly authService: AuthorizationService) {
    super();
  }

  async handle(user: User, label?: Label): Promise<boolean> {
    // Admin und Manager dürfen Labels erstellen
    return this.authService.hasPermission(user, Permission.CREATE_LABEL);
  }
}
