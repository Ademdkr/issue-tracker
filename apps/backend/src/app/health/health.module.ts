import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health Module
 *
 * Stellt Health Check Endpoints bereit:
 * - GET /api/health - Vollständiger Health Check
 * - GET /api/health/ready - Readiness Probe
 * - GET /api/health/live - Liveness Probe
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
