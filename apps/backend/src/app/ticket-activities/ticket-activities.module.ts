import { Module } from '@nestjs/common';
import { TicketActivitiesService } from './ticket-activities.service';
import { TicketActivitiesController } from './ticket-activities.controller';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Ticket Activities Module
 * Verwaltet Aktivitäts-Logging für Tickets
 */
@Module({
  controllers: [TicketActivitiesController],
  providers: [TicketActivitiesService, PrismaService],
  exports: [TicketActivitiesService],
})
export class TicketActivitiesModule {}
