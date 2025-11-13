import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from '../prisma.service';
import { RoleGuard } from '../guards/role.guard';
import { ProjectAccessGuard } from '../guards/project-access.guard';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, RoleGuard, ProjectAccessGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
