import { Module, forwardRef } from '@nestjs/common';
import { TicketActivitiesService } from './ticket-activities.service';
import { TicketActivitiesController } from './ticket-activities.controller';
import { ProjectsModule } from '../projects/projects.module';

/**
 * Ticket Activities Module
 * Verwaltet Aktivitäts-Logging für Tickets
 */
@Module({
  imports: [forwardRef(() => ProjectsModule)],
  controllers: [TicketActivitiesController],
  providers: [TicketActivitiesService],
  exports: [TicketActivitiesService],
})
export class TicketActivitiesModule {}
