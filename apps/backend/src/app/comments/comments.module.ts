import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ProjectsModule } from '../projects/projects.module';

/**
 * Comments Module
 * Verwaltet Kommentare für Tickets
 */
@Module({
  imports: [ProjectsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
