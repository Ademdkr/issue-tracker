import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@issue-tracker/shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard für rollenbasierte Zugriffskontrolle
 * Arbeitet mit @Roles() Decorator
 *
 * User muss bereits am Request verfügbar sein (via CurrentUserInterceptor)
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Erforderliche Rollen aus Metadata holen
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Keine Rollen erforderlich
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Prüfe ob User eine der erforderlichen Rollen hat
    const hasRole = requiredRoles.some((role) => {
      // Admin kann alles
      if (user.role === UserRole.ADMIN) {
        return true;
      }
      // Exakte Rollenübereinstimmung
      return user.role === role;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
