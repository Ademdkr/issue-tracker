import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { LabelsService } from '../labels/labels.service';
import { TicketsService } from '../tickets/tickets.service';
import { PrismaService } from '../prisma.service';
import { RoleGuard, ProjectAccessGuard } from '../common/guards';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    LabelsService,
    TicketsService,
    PrismaService,
    RoleGuard,
    ProjectAccessGuard,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
