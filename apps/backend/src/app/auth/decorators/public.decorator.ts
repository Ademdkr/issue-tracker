import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public Decorator
 *
 * Markiert eine Route als öffentlich zugänglich (kein JWT erforderlich).
 *
 * Verwendung:
 * ```typescript
 * @Public()
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Login-Route ohne JWT-Schutz
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   async login() { ... }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
