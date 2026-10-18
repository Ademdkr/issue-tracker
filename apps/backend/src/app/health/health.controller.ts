import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health Check Controller
 *
 * Öffentlicher Endpoint für Monitoring und Load Balancer
 * Prüft Verfügbarkeit von Backend und Datenbank
 */
@Controller('health')
@SkipThrottle()
export class HealthController {
  private databaseCheck?: { expiresAt: number; result: Promise<void> };

  constructor(private readonly prisma: PrismaService) {}

  private checkDatabase(): Promise<void> {
    const now = Date.now();
    if (!this.databaseCheck || this.databaseCheck.expiresAt <= now) {
      // Render and Docker may probe concurrently. Share one query per minute,
      // including failed checks, to preserve the free database query allowance.
      this.databaseCheck = {
        expiresAt: now + 60_000,
        result: this.prisma.$queryRaw`SELECT 1`.then(() => undefined),
      };
    }
    return this.databaseCheck.result;
  }

  /**
   * Health Check Endpoint
   *
   * @returns Status-Informationen über Backend und Datenbank
   * @throws ServiceUnavailableException bei Datenbank-Verbindungsproblemen
   */
  @Public()
  @Get()
  async check() {
    const timestamp = new Date().toISOString();

    try {
      await this.checkDatabase();

      return {
        status: 'ok',
        timestamp,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0',
        commit: process.env.RENDER_GIT_COMMIT || 'local',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'disconnected',
      });
    }
  }

  /**
   * Readiness Check
   *
   * Kubernetes/Docker Readiness Probe
   * Gibt nur 200 zurück wenn System bereit für Traffic ist
   */
  @Public()
  @Get('ready')
  async ready() {
    try {
      await this.checkDatabase();
      return { ready: true, commit: process.env.RENDER_GIT_COMMIT || 'local' };
    } catch {
      throw new ServiceUnavailableException({ ready: false });
    }
  }

  /**
   * Liveness Check
   *
   * Kubernetes/Docker Liveness Probe
   * Gibt immer 200 zurück solange Prozess läuft
   */
  @Public()
  @Get('live')
  live() {
    return { alive: true };
  }
}
