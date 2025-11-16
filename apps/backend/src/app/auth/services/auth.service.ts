import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database';
import * as bcrypt from 'bcrypt';
import { User } from '@issue-tracker/shared-types';

/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
}

/**
 * Login Response Interface
 */
export interface LoginResponse {
  access_token: string;
  user: User;
}

/**
 * Auth Service
 *
 * Verwaltet Authentication-Logik:
 * - Login mit Email/Passwort
 * - JWT Token-Generierung
 * - User-Validierung
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * User-Login mit Email und Passwort
   *
   * @param email - User Email
   * @param password - Klartext-Passwort
   * @returns LoginResponse mit JWT Token und User-Daten
   * @throws UnauthorizedException wenn Credentials ungültig
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // 1. User aus DB laden
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Passwort verifizieren
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. JWT Token generieren
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // 4. Response zusammenstellen (ohne Passwort!)
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
      createdAt: user.createdAt,
    };

    return {
      access_token: accessToken,
      user: userWithoutPassword as User,
    };
  }

  /**
   * User anhand JWT-Payload validieren
   *
   * Wird von JwtStrategy nach Token-Dekodierung aufgerufen
   *
   * @param payload - JWT Payload
   * @returns User oder null
   */
  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return null;
    }

    // User-Objekt ohne Passwort zurückgeben
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
      createdAt: user.createdAt,
    };

    return userWithoutPassword as User;
  }
}
