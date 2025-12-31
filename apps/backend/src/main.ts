/**
 * Issue Tracker Backend
 * Production-ready NestJS Application
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Environment Variablen früh deklarieren
  const port = process.env.PORT || 3000;
  const environment = process.env.NODE_ENV || 'development';

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
      ? [
          process.env.FRONTEND_URL || 'https://issue-tracker.ademdokur.dev',
          'https://issue-tracker.ademdokur.dev',
          // Render Backend URL für Health Checks
          'https://issue-tracker-frontend-1tn2.onrender.com',
          // Localhost für Docker Full-Stack Testing
          'http://localhost',
          'http://localhost:80',
          'http://localhost:4200',
        ]
      : [
          'http://localhost:4200',
          'http://localhost:4201',
          'http://localhost',
          'http://localhost:80',
          'http://localhost:3000',
        ];

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

  // Swagger API-Dokumentation (nur in Development, NIE in Production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Issue Tracker API')
      .setDescription(
        'REST API für Issue Tracker - Enterprise Issue Management System mit JWT Auth, RBAC und Policy-basierter Autorisierung'
      )
      .setVersion('1.0')
      .setContact(
        'Adem Dokur',
        'https://github.com/Ademdkr/issue-tracker',
        'adem.dokur@outlook.de'
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT Access Token (erhalten via /api/auth/login)',
          in: 'header',
        },
        'JWT-auth'
      )
      .addTag('auth', 'Authentifizierung & Token-Management')
      .addTag('users', 'Benutzerverwaltung')
      .addTag('projects', 'Projektverwaltung')
      .addTag('tickets', 'Ticket/Issue-Management')
      .addTag('comments', 'Kommentar-System')
      .addTag('labels', 'Label-Verwaltung')
      .addTag('health', 'Health Checks & Monitoring')
      .addServer('http://localhost:3000', 'Development Server')
      .addServer('https://api.issue-tracker.example.com', 'Production Server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Issue Tracker API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    Logger.log(
      `📚 Swagger API Docs: http://localhost:${port}/${globalPrefix}/docs`,
      'Bootstrap'
    );
  } else {
    Logger.log('📚 Swagger disabled in production', 'Bootstrap');
  }

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
