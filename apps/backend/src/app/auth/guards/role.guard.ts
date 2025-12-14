import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, User } from '@issue-tracker/shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard für rollenbasierte Zugriffskontrolle
 *
 * Prüft, ob der User eine der erforderlichen Rollen besitzt.
 * Arbeitet mit dem @Roles() Decorator.
 *
 * @remarks
 * - ADMIN hat immer Zugriff (Super-User Rolle)
 * - Andere Rollen benötigen exakte Übereinstimmung
 * - Setzt voraus, dass CurrentUserGuard bereits gelaufen ist
 *
 * @example
 * ```typescript
 * @Get()
 * @UseGuards(RoleGuard)
 * @Roles(UserRole.MANAGER, UserRole.ADMIN)
 * async getAll() { ... }
 * ```
 *
 * @throws {ForbiddenException} Wenn User nicht die erforderliche Rolle hat
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.getRequiredRoles(context);

    // Kein @Roles() Decorator → Zugriff erlauben
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    // Admin hat Super-User-Rechte (immer Zugriff)
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Prüfe ob User eine der erforderlichen Rollen hat
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(
          ', '
        )}. Your role: ${user.role}`
      );
    }

    return true;
  }

  /**
   * Extrahiert erforderliche Rollen aus Metadaten
   *
   * @param context - ExecutionContext
   * @returns Array von erforderlichen Rollen oder undefined
   *
   * @remarks
   * Verwendet getAllAndOverride() um sowohl Controller- als auch
   * Method-Level Decorators zu berücksichtigen. Method-Level hat Vorrang.
   */
  private getRequiredRoles(context: ExecutionContext): UserRole[] | undefined {
    return this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Method-Level @Roles()
      context.getClass(), // Controller-Level @Roles()
    ]);
  }
}
