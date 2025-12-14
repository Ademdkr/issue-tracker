import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 *
 * Schützt Routen mit JWT Token Validierung.
 * Token wird aus Authorization Header extrahiert: "Bearer <token>"
 *
 * Routen können mit @Public() Decorator von der Validierung ausgenommen werden.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Prüft ob Route JWT-Authentifizierung erfordert
   *
   * @param context - Execution Context
   * @returns true wenn Zugriff erlaubt, sonst false
   */
  canActivate(context: ExecutionContext) {
    // Prüfe ob Route als @Public() markiert ist
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Kein JWT erforderlich
    }

    // Normale JWT-Validierung
    return super.canActivate(context);
  }
}
