import { Module, forwardRef } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { ProjectsModule } from '../projects/projects.module';
import { TicketActivitiesModule } from '../ticket-activities/ticket-activities.module';

/**
 * Tickets Module
 *
 * Bietet globalen Ticket-Zugriff über alle Projekte (rollenbasiert gefiltert)
 * Für detaillierte Ticket-Operationen siehe ProjectsModule
 */
@Module({
  imports: [ProjectsModule, forwardRef(() => TicketActivitiesModule)],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
