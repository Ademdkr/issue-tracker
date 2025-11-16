import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../services/auth.service';
import { User } from '@issue-tracker/shared-types';

/**
 * JWT Strategy
 *
 * Passport-Strategy für JWT-basierte Authentifizierung.
 * Extrahiert Token aus Authorization Header und validiert User.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  /**
   * Passport ruft diese Methode automatisch nach Token-Validierung auf
   *
   * @param payload - Dekodiertes JWT Payload
   * @returns User-Objekt (wird zu request.user)
   * @throws UnauthorizedException wenn User nicht existiert
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user; // ← Wird zu request.user
  }
}
