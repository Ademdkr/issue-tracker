import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { User } from '@issue-tracker/shared-types';

/**
 * Guard für Authentifizierung via x-user-id Header
 *
 * Lädt den User aus der Datenbank und macht ihn als request.user verfügbar.
 * Muss als globaler Guard (APP_GUARD) registriert sein, um vor allen anderen
 * Guards zu laufen.
 *
 * @remarks
 * TEMPORÄR: Wird durch JWT Authentication (passport-jwt) ersetzt.
 *
 * @throws {UnauthorizedException} Wenn Header fehlt oder User nicht existiert
 */
@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = this.extractUserId(request.headers['x-user-id']);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(
        `User with ID '${userId}' not found. Please check your credentials.`
      );
    }

    request.user = user as User;
    return true;
  }

  /**
   * Extrahiert und validiert die User-ID aus dem Header
   *
   * @param headerValue - Wert des x-user-id Headers
   * @returns Validierte User-ID
   * @throws {UnauthorizedException} Bei fehlendem oder ungültigem Header
   */
  private extractUserId(headerValue: string | string[] | undefined): string {
    if (!headerValue) {
      throw new UnauthorizedException(
        'Authentication required. Please provide x-user-id header.'
      );
    }

    if (Array.isArray(headerValue)) {
      throw new UnauthorizedException(
        'Invalid x-user-id header format. Expected single value, got array.'
      );
    }

    if (headerValue.trim() === '') {
      throw new UnauthorizedException('x-user-id header cannot be empty.');
    }

    return headerValue.trim();
  }
}
