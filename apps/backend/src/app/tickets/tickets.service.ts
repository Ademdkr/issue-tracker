import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthorizationService } from '../authorization/services/authorization.service';
import {
  UpdateTicketPolicyHandler,
  AssignTicketPolicyHandler,
  SetTicketPriorityPolicyHandler,
  SetTicketStatusPolicyHandler,
} from '../authorization/policies';
import {
  Ticket as PrismaTicket,
  TicketPriority as PrismaTicketPriority,
} from '@prisma/client';
import {
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
  TicketStatus,
  TicketPriority,
  User,
  UserRole,
} from '@issue-tracker/shared-types';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthorizationService,
    private updateTicketPolicy: UpdateTicketPolicyHandler,
    private assignTicketPolicy: AssignTicketPolicyHandler,
    private setPriorityPolicy: SetTicketPriorityPolicyHandler,
    private setStatusPolicy: SetTicketStatusPolicyHandler
  ) {}

  /**
   * Mapper: Prisma Ticket → Shared-Types Ticket
   */
  private mapPrismaToTicket(prismaTicket: PrismaTicket): Ticket {
    return {
      id: prismaTicket.id,
      projectId: prismaTicket.projectId,
      reporterId: prismaTicket.reporterId,
      assigneeId: prismaTicket.assigneeId || undefined,
      title: prismaTicket.title,
      description: prismaTicket.description,
      status: prismaTicket.status as TicketStatus,
      priority: prismaTicket.priority as TicketPriority,
      createdAt: prismaTicket.createdAt,
      updatedAt: prismaTicket.updatedAt,
    };
  }

  /**
   * Ticket für ein Projekt erstellen
   *
   * Validierung:
   * - Projekt muss existieren
   * - Reporter muss existieren und Projektmitglied, Manager oder Admin sein
   * - Assignee muss existieren (falls angegeben)
   *
   * Berechtigungen:
   * - Reporter: Kann nur title/description setzen → priority=MEDIUM, assignee=null
   * - Developer: Kann priority setzen und sich selbst als Assignee
   * - Manager/Admin: Können alles setzen
   *
   * @param projectId - UUID des Projekts (aus Route-Parameter)
   * @param reporterId - UUID des angemeldeten Users (wird automatisch Reporter)
   * @param createTicketDto - Ticket-Daten
   * @returns Erstelltes Ticket
   */
  async create(
    projectId: string,
    reporterId: string,
    createTicketDto: CreateTicketDto
  ): Promise<Ticket> {
    // 1. Prüfe ob Projekt existiert
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Prüfe ob Reporter (angemeldeter User) existiert
    const reporter = await this.prisma.user.findUnique({
      where: { id: reporterId },
      select: { id: true, role: true },
    });

    if (!reporter) {
      throw new NotFoundException('Reporter user not found');
    }

    // 3. Prüfe ob Reporter Zugriff auf Projekt hat (Mitglied, Manager oder Admin)
    const isAdmin = reporter.role === UserRole.ADMIN;
    const isManager = reporter.role === UserRole.MANAGER;
    const isDeveloper = reporter.role === UserRole.DEVELOPER;
    const isReporter = reporter.role === UserRole.REPORTER;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: reporterId,
        },
      },
    });

    if (!isAdmin && !isManager && !projectMember) {
      throw new ForbiddenException(
        'User must be a project member, manager, or admin to create tickets'
      );
    }

    // 4. Rollenbasierte Berechtigungen anwenden
    let finalPriority: TicketPriority;
    let finalAssigneeId: string | null = null;

    if (isReporter) {
      // Reporter: Darf KEINE Priorität oder Assignee setzen
      if (createTicketDto.priority || createTicketDto.assigneeId) {
        throw new BadRequestException(
          'Reporters cannot set priority or assignee. These fields will be set automatically.'
        );
      }
      finalPriority = TicketPriority.MEDIUM; // Standard-Priorität
      finalAssigneeId = null; // Kein Assignee
    } else if (isDeveloper) {
      // Developer: Kann Priorität setzen, aber nur sich selbst als Assignee
      finalPriority = createTicketDto.priority || TicketPriority.MEDIUM;

      if (createTicketDto.assigneeId) {
        if (createTicketDto.assigneeId !== reporterId) {
          throw new BadRequestException(
            'Developers can only assign tickets to themselves'
          );
        }
        finalAssigneeId = createTicketDto.assigneeId;
      }
    } else {
      // Manager/Admin: Können alles setzen
      finalPriority = createTicketDto.priority || TicketPriority.MEDIUM;
      finalAssigneeId = createTicketDto.assigneeId || null;
    }

    // 5. Falls Assignee gesetzt: Prüfe ob dieser existiert und Projektmitglied ist
    if (finalAssigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: finalAssigneeId },
        select: { id: true, role: true },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee user not found');
      }

      // Reporter können nicht als Assignee gesetzt werden
      if (assignee.role === UserRole.REPORTER) {
        throw new BadRequestException(
          'Reporters cannot be assigned to tickets'
        );
      }

      // Prüfe ob Assignee Projektmitglied, Manager oder Admin ist
      const isAssigneeAdmin = assignee.role === UserRole.ADMIN;
      const isAssigneeManager = assignee.role === UserRole.MANAGER;
      const isAssigneeMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: finalAssigneeId,
          },
        },
      });

      if (!isAssigneeAdmin && !isAssigneeManager && !isAssigneeMember) {
        throw new BadRequestException(
          'Assignee must be a project member, manager, or admin'
        );
      }
    }

    // 6. Erstelle Ticket mit finalen Werten
    const ticket = await this.prisma.ticket.create({
      data: {
        projectId,
        reporterId, // Automatisch der angemeldete User
        assigneeId: finalAssigneeId,
        title: createTicketDto.title,
        description: createTicketDto.description,
        status: TicketStatus.OPEN, // Immer OPEN bei Erstellung
        priority: finalPriority as PrismaTicketPriority,
      },
    });

    // 7. Konvertiere Prisma-Ticket zu Shared-Types-Ticket
    return this.mapPrismaToTicket(ticket);
  }

  /**
   * Alle Tickets eines Projekts abrufen
   *
   * @param projectId - UUID des Projekts
   * @returns Liste aller Tickets (sortiert nach Erstellungsdatum, neueste zuerst)
   */
  async findAllByProject(projectId: string): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Konvertiere Prisma-Tickets zu Shared-Types-Tickets
    return tickets.map((ticket) => this.mapPrismaToTicket(ticket));
  }

  /**
   * Ticket aktualisieren
   *
   * Verwendet Policy-Based Authorization für saubere Berechtigungsprüfung
   *
   * @param user - Der angemeldete User
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @param updateTicketDto - Zu aktualisierende Felder
   * @returns Aktualisiertes Ticket
   */
  async update(
    user: User,
    projectId: string,
    ticketId: string,
    updateTicketDto: UpdateTicketDto
  ): Promise<Ticket> {
    // 1. Ticket laden
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, projectId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this project');
    }

    // Konvertiere Prisma-Ticket zu Shared-Types für Policy
    const ticketForPolicy = this.mapPrismaToTicket(ticket);

    // 2. Update-Permission prüfen
    const canUpdate = await this.updateTicketPolicy.handle(
      user,
      ticketForPolicy
    );
    if (!canUpdate) {
      throw new ForbiddenException('You cannot update this ticket');
    }

    // 3. Update-Daten vorbereiten
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    // Title & Description: Alle berechtigten User können ändern
    if (updateTicketDto.title !== undefined) {
      updateData.title = updateTicketDto.title;
    }
    if (updateTicketDto.description !== undefined) {
      updateData.description = updateTicketDto.description;
    }

    // Priority: Policy prüfen
    if (updateTicketDto.priority !== undefined) {
      const canSetPriority = await this.setPriorityPolicy.handle(
        user,
        ticketForPolicy
      );
      if (!canSetPriority) {
        throw new ForbiddenException('You cannot set ticket priority');
      }
      updateData.priority = updateTicketDto.priority as PrismaTicketPriority;
    }

    // Status: Policy prüfen
    if (updateTicketDto.status !== undefined) {
      const canSetStatus = await this.setStatusPolicy.handle(
        user,
        ticketForPolicy
      );
      if (!canSetStatus) {
        throw new ForbiddenException('You cannot set ticket status');
      }
      updateData.status = updateTicketDto.status;
    }

    // Assignee: Policy prüfen
    if (updateTicketDto.assigneeId !== undefined) {
      const canAssign = await this.assignTicketPolicy.handle(user, {
        ticket: ticketForPolicy,
        assigneeId: updateTicketDto.assigneeId,
      });

      if (!canAssign) {
        throw new ForbiddenException(
          user.role === UserRole.DEVELOPER
            ? 'Developers can only assign tickets to themselves'
            : 'You cannot assign tickets'
        );
      }

      // Assignee-Validierung (falls nicht null)
      if (updateTicketDto.assigneeId !== null) {
        await this.validateAssignee(projectId, updateTicketDto.assigneeId);
      }

      updateData.assigneeId = updateTicketDto.assigneeId;
    }

    // 4. Ticket aktualisieren
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return this.mapPrismaToTicket(updatedTicket);
  }

  /**
   * Validiert ob ein User als Assignee gesetzt werden kann
   *
   * @param projectId - Projekt-ID
   * @param assigneeId - User-ID des Assignees
   * @throws BadRequestException wenn Validierung fehlschlägt
   */
  private async validateAssignee(
    projectId: string,
    assigneeId: string
  ): Promise<void> {
    // User muss existieren
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
      select: { id: true, role: true },
    });

    if (!assignee) {
      throw new BadRequestException('Assignee user not found');
    }

    // Reporter können nicht als Assignee gesetzt werden
    if (assignee.role === UserRole.REPORTER) {
      throw new BadRequestException('Reporters cannot be assigned to tickets');
    }

    // Prüfe ob Assignee Projektmitglied, Manager oder Admin ist
    const isAdmin = assignee.role === UserRole.ADMIN;
    const isManager = assignee.role === UserRole.MANAGER;

    if (!isAdmin && !isManager) {
      const isMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: assigneeId,
          },
        },
      });

      if (!isMember) {
        throw new BadRequestException(
          'Assignee must be a project member, manager, or admin'
        );
      }
    }
  }
}
