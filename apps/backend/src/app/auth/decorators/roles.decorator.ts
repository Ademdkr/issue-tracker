import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@issue-tracker/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Decorator um erforderliche Rollen zu definieren
 *
 * @example
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * async deleteProject() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
