import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { SlugGeneratorService } from './slug-generator.service';
import { LabelsService } from '../labels/labels.service';
import { TicketsService } from '../tickets/tickets.service';
import { TicketActivitiesModule } from '../ticket-activities/ticket-activities.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoleGuard, ProjectAccessGuard } from '../common/guards';

@Module({
  imports: [TicketActivitiesModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    SlugGeneratorService,
    LabelsService,
    TicketsService,
    PrismaService,
    RoleGuard,
    ProjectAccessGuard,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
