import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health Check Controller
 *
 * Öffentlicher Endpoint für Monitoring und Load Balancer
 * Prüft Verfügbarkeit von Backend und Datenbank
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

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
      // Prüfe Datenbank-Verbindung mit einfacher Query
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
      await this.prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch (error) {
      throw new Error('Database not ready');
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
