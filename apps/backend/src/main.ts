/**
 * Issue Tracker Backend
 * Production-ready NestJS Application
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/core/app.module';

/**
 * Validiert erforderliche Environment Variables beim Start
 * Verhindert Backend-Start bei fehlenden kritischen Variablen
 */
function validateEnvironment(): void {
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    Logger.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`,
      'Bootstrap'
    );
    Logger.error(
      'Please create apps/backend/.env file based on .env.example',
      'Bootstrap'
    );
    process.exit(1);
  }

  // Validiere JWT_SECRET Länge (mindestens 32 Zeichen)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    Logger.warn(
      '⚠️  JWT_SECRET should be at least 32 characters for production security',
      'Bootstrap'
    );
  }

  Logger.log('✅ Environment variables validated', 'Bootstrap');
}

async function bootstrap() {
  // Validiere Environment vor App-Erstellung
  validateEnvironment();

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log'] // Production: Weniger Logs
        : ['error', 'warn', 'log', 'debug', 'verbose'], // Development: Alle Logs
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS aktivieren für Frontend-Zugriff
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://issue-tracker.example.com']
      : ['http://localhost:4200', 'http://localhost:4201'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // entfernt unbekannte Properties
      forbidNonWhitelisted: true, // wirft Fehler bei unbekannten Properties
      transform: true, // wandelt Payload in DTO-Klassen um
    })
  );

  const port = process.env.PORT || 3000;
  const environment = process.env.NODE_ENV || 'development';

  await app.listen(port);

  Logger.log(`🚀 Application started successfully`, 'Bootstrap');
  Logger.log(
    `📍 Running on: http://localhost:${port}/${globalPrefix}`,
    'Bootstrap'
  );
  Logger.log(`🌍 Environment: ${environment}`, 'Bootstrap');
  Logger.log(`🔒 Rate Limiting: 100 requests/minute`, 'Bootstrap');
  Logger.log(
    `💚 Health Check: http://localhost:${port}/${globalPrefix}/health`,
    'Bootstrap'
  );

  if (environment === 'development') {
    Logger.debug(`🔧 CORS Origins: ${allowedOrigins.join(', ')}`, 'Bootstrap');
    Logger.debug(
      `🔑 JWT Secret Length: ${process.env.JWT_SECRET?.length} chars`,
      'Bootstrap'
    );
  }
}

bootstrap();
