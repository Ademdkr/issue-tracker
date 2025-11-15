import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CurrentUserInterceptor } from '../common/interceptors';
import { RoleGuard } from '../common/guards/role.guard';
import { ProjectAccessGuard } from '../common/guards/project-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  User,
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from '@issue-tracker/shared-types';

/**
 * Comments Controller
 *
 * Nested unter Projects/Tickets:
 * - Alle Routen erfordern Projektzugriff (ProjectAccessGuard)
 * - Alle Routen erfordern mindestens REPORTER-Rolle
 *
 * Routen:
 * - GET    /api/projects/:projectId/tickets/:ticketId/comments
 * - POST   /api/projects/:projectId/tickets/:ticketId/comments
 * - PATCH  /api/projects/:projectId/tickets/:ticketId/comments/:commentId
 * - DELETE /api/projects/:projectId/tickets/:ticketId/comments/:commentId
 */
@Controller('projects/:projectId/tickets/:ticketId/comments')
@UseGuards(RoleGuard, ProjectAccessGuard)
@UseInterceptors(CurrentUserInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Alle Kommentare eines Tickets abrufen
   * GET /api/projects/:projectId/tickets/:ticketId/comments
   *
   * Berechtigungen:
   * - Alle Rollen können Kommentare lesen, wenn sie Zugriff aufs Projekt haben
   */
  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string
  ): Promise<Comment[]> {
    return await this.commentsService.findAllByTicket(projectId, ticketId);
  }

  /**
   * Kommentar erstellen
   * POST /api/projects/:projectId/tickets/:ticketId/comments
   *
   * Berechtigungen:
   * - Alle Rollen können Kommentare erstellen, wenn sie Zugriff aufs Projekt haben
   */
  @Post()
  async create(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() createCommentDto: CreateCommentDto
  ): Promise<Comment> {
    return await this.commentsService.create(
      user,
      projectId,
      ticketId,
      createCommentDto
    );
  }

  /**
   * Kommentar aktualisieren
   * PATCH /api/projects/:projectId/tickets/:ticketId/comments/:commentId
   *
   * Berechtigungen (über UpdateCommentPolicyHandler):
   * - Reporter: Nur eigene Kommentare
   * - Developer: Nur eigene Kommentare, wenn Creator oder Assignee des Tickets
   * - Manager/Admin: Alle Kommentare
   */
  @Patch(':commentId')
  async update(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto
  ): Promise<Comment> {
    return await this.commentsService.update(
      user,
      projectId,
      ticketId,
      commentId,
      updateCommentDto
    );
  }

  /**
   * Kommentar löschen
   * DELETE /api/projects/:projectId/tickets/:ticketId/comments/:commentId
   *
   * Berechtigungen (über DeleteCommentPolicyHandler):
   * - Reporter: Nur eigene Kommentare
   * - Developer: Nur eigene Kommentare, wenn Creator oder Assignee des Tickets
   * - Manager/Admin: Alle Kommentare
   */
  @Delete(':commentId')
  async remove(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string
  ): Promise<Comment> {
    return await this.commentsService.remove(
      user,
      projectId,
      ticketId,
      commentId
    );
  }
}
