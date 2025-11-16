import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { CommentsModule } from '../comments/comments.module';
import { TicketsModule } from '../tickets/tickets.module';
import { CurrentUserGuard } from '../auth';
import { PrismaModule } from '../database';

@Module({
  imports: [
    PrismaModule, // Global verfügbar
    AuthModule,
    UsersModule,
    ProjectsModule,
    TicketsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CurrentUserGuard,
    },
  ],
})
export class AppModule {}
