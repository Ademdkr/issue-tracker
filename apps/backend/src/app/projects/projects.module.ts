import { Module, forwardRef } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { SlugGeneratorService } from './slug-generator.service';
import { LabelsService } from '../labels/labels.service';
import { TicketsService } from '../tickets/tickets.service';
import { TicketActivitiesModule } from '../ticket-activities/ticket-activities.module';

@Module({
  imports: [forwardRef(() => TicketActivitiesModule)],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    SlugGeneratorService,
    LabelsService,
    TicketsService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
