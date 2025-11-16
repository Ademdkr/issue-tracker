import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database';
import {
  UpdateCommentPolicyHandler,
  DeleteCommentPolicyHandler,
} from '../auth/policies';
import { Comment as PrismaComment } from '@prisma/client';
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  User,
} from '@issue-tracker/shared-types';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private updateCommentPolicy: UpdateCommentPolicyHandler,
    private deleteCommentPolicy: DeleteCommentPolicyHandler
  ) {}

  /**
   * Mapper: Prisma Comment → Shared-Types Comment
   */
  private mapPrismaToComment(prismaComment: PrismaComment): Comment {
    return {
      id: prismaComment.id,
      ticketId: prismaComment.ticketId,
      authorId: prismaComment.authorId,
      content: prismaComment.content,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt || undefined,
    };
  }

  /**
   * Alle Kommentare eines Tickets abrufen
   *
   * Validierung:
   * - Ticket muss existieren
   * - User muss Zugriff auf das Projekt haben (wird durch Guards geprüft)
   *
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @returns Array von Kommentaren
   */
  async findAllByTicket(
    projectId: string,
    ticketId: string
  ): Promise<Comment[]> {
    // 1. Prüfe ob Ticket existiert und zum Projekt gehört
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        projectId: projectId,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this project');
    }

    // 2. Lade alle Kommentare des Tickets
    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => this.mapPrismaToComment(c));
  }

  /**
   * Kommentar erstellen
   *
   * Validierung:
   * - Ticket muss existieren und zum Projekt gehören
   * - User muss Zugriff auf das Projekt haben (wird durch Guards geprüft)
   *
   * Berechtigungen:
   * - Alle Rollen können Kommentare erstellen, wenn sie Zugriff aufs Projekt haben
   *
   * @param user - Angemeldeter User (wird Author)
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @param createCommentDto - Kommentar-Daten
   * @returns Erstellter Kommentar
   */
  async create(
    user: User,
    projectId: string,
    ticketId: string,
    createCommentDto: CreateCommentDto
  ): Promise<Comment> {
    // 1. Prüfe ob Ticket existiert und zum Projekt gehört
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        projectId: projectId,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this project');
    }

    // 2. Erstelle Kommentar
    const comment = await this.prisma.comment.create({
      data: {
        ticketId,
        authorId: user.id,
        content: createCommentDto.content,
      },
    });

    return this.mapPrismaToComment(comment);
  }

  /**
   * Kommentar aktualisieren
   *
   * Validierung:
   * - Kommentar muss existieren
   * - Kommentar muss zum Ticket und Projekt gehören
   *
   * Berechtigungen (über UpdateCommentPolicyHandler):
   * - Reporter: Nur eigene Kommentare
   * - Developer: Nur eigene Kommentare, wenn Creator oder Assignee des Tickets
   * - Manager/Admin: Alle Kommentare
   *
   * @param user - Angemeldeter User
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @param commentId - UUID des Kommentars
   * @param updateCommentDto - Neue Kommentar-Daten
   * @returns Aktualisierter Kommentar
   */
  async update(
    user: User,
    projectId: string,
    ticketId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto
  ): Promise<Comment> {
    // 1. Lade Kommentar mit Ticket-Informationen
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId },
      include: {
        ticket: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 2. Prüfe ob Kommentar zum richtigen Ticket und Projekt gehört
    if (
      comment.ticketId !== ticketId ||
      comment.ticket.projectId !== projectId
    ) {
      throw new NotFoundException('Comment not found in this ticket');
    }

    // 3. Prüfe Berechtigungen über Policy Handler
    const canUpdate = await this.updateCommentPolicy.handle(user, comment);
    if (!canUpdate) {
      throw new ForbiddenException(
        'You do not have permission to update this comment'
      );
    }

    // 4. Aktualisiere Kommentar
    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
        updatedAt: new Date(),
      },
    });

    return this.mapPrismaToComment(updatedComment);
  }

  /**
   * Kommentar löschen
   *
   * Validierung:
   * - Kommentar muss existieren
   * - Kommentar muss zum Ticket und Projekt gehören
   *
   * Berechtigungen (über DeleteCommentPolicyHandler):
   * - Reporter: Nur eigene Kommentare
   * - Developer: Nur eigene Kommentare, wenn Creator oder Assignee des Tickets
   * - Manager/Admin: Alle Kommentare
   *
   * @param user - Angemeldeter User
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @param commentId - UUID des Kommentars
   * @returns Gelöschter Kommentar
   */
  async remove(
    user: User,
    projectId: string,
    ticketId: string,
    commentId: string
  ): Promise<Comment> {
    // 1. Lade Kommentar mit Ticket-Informationen
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId },
      include: {
        ticket: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 2. Prüfe ob Kommentar zum richtigen Ticket und Projekt gehört
    if (
      comment.ticketId !== ticketId ||
      comment.ticket.projectId !== projectId
    ) {
      throw new NotFoundException('Comment not found in this ticket');
    }

    // 3. Prüfe Berechtigungen über Policy Handler
    const canDelete = await this.deleteCommentPolicy.handle(user, comment);
    if (!canDelete) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment'
      );
    }

    // 4. Lösche Kommentar
    const deletedComment = await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return this.mapPrismaToComment(deletedComment);
  }
}
