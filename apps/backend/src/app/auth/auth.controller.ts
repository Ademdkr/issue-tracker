import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto, LoginResponse } from '@issue-tracker/shared-types';

/**
 * Authentication Controller
 *
 * Verwaltet öffentliche Authentication-Endpunkte.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User-Login
   * POST /api/auth/login
   *
   * Body:
   * {
   *   "email": "admin@example.com",
   *   "password": "Admin123!"
   * }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": { "id": "...", "email": "...", "role": "ADMIN", ... }
   * }
   *
   * @param loginDto - Login-Credentials
   * @returns JWT Token und User-Daten
   * @throws UnauthorizedException bei ungültigen Credentials
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
