import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { CommentsModule } from '../comments/comments.module';
import { TicketsModule } from '../tickets/tickets.module';
import { DashboardModule } from '../dashboard';
import { HealthModule } from '../health';
import { JwtAuthGuard } from '../auth';
import { PrismaModule } from '../database';

@Module({
  imports: [
    // Rate Limiting: Max 100 requests pro Minute pro IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 Sekunden
        limit: 100, // Max 100 Requests
      },
    ]),
    PrismaModule, // Global verfügbar
    AuthModule,
    UsersModule,
    ProjectsModule,
    TicketsModule,
    CommentsModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // JWT Guard statt CurrentUserGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate Limiting Guard
    },
  ],
})
export class AppModule {}
