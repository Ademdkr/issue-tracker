import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthorizationService } from '../authorization/services/authorization.service';
import { TicketActivitiesService } from '../ticket-activities/ticket-activities.service';
import {
  UpdateTicketPolicyHandler,
  AssignTicketPolicyHandler,
  SetTicketPriorityPolicyHandler,
  SetTicketStatusPolicyHandler,
} from '../authorization/policies';
import {
  Ticket as PrismaTicket,
  TicketPriority as PrismaTicketPriority,
  TicketLabel as PrismaTicketLabel,
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
    private activityService: TicketActivitiesService,
    private updateTicketPolicy: UpdateTicketPolicyHandler,
    private assignTicketPolicy: AssignTicketPolicyHandler,
    private setPriorityPolicy: SetTicketPriorityPolicyHandler,
    private setStatusPolicy: SetTicketStatusPolicyHandler
  ) {}

  /**
   * Mapper: Prisma Ticket → Shared-Types Ticket
   */
  private mapPrismaToTicket(
    prismaTicket: PrismaTicket & { ticketLabels?: PrismaTicketLabel[] }
  ): Ticket {
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
      labelIds: prismaTicket.ticketLabels?.map((tl) => tl.labelId) || [],
    };
  }

  /**
   * Ticket für ein Projekt erstellen
   *
   * Validierung:
   * - Projekt muss existieren
   * - Reporter muss existieren
   * - Assignee muss existieren (falls angegeben)
   * - Projektzugriff wird durch ProjectAccessGuard im Controller geprüft
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

    // 3. Rollenbasierte Berechtigungen anwenden
    const isReporter = reporter.role === UserRole.REPORTER;
    const isDeveloper = reporter.role === UserRole.DEVELOPER;

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

    // 4. Falls Assignee gesetzt: Validiere Assignee
    if (finalAssigneeId) {
      await this.validateAssignee(projectId, finalAssigneeId);
    }

    // 5. Labels validieren (falls vorhanden)
    if (createTicketDto.labelIds && createTicketDto.labelIds.length > 0) {
      await this.validateLabels(projectId, createTicketDto.labelIds);
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
        ticketLabels: createTicketDto.labelIds
          ? {
              create: createTicketDto.labelIds.map((labelId) => ({
                labelId,
              })),
            }
          : undefined,
      },
      include: {
        ticketLabels: true,
      },
    });

    // 7. Konvertiere Prisma-Ticket zu Shared-Types-Ticket
    return this.mapPrismaToTicket(ticket);
  }

  /**
   * Alle Tickets abrufen (rollenbasiert gefiltert)
   *
   * Filterlogik:
   * - Manager/Admin: Alle Tickets
   * - Reporter: Nur selbst erstellte Tickets (reporterId = currentUser.id)
   * - Developer: Selbst erstellte + Tickets aus Projekten wo User Mitglied ist
   *
   * @param user - Der angemeldete User
   * @param filters - Optionale Filter für Projekt, Status, Priorität, Assignee, Label, Suche
   * @returns Liste der Tickets (sortiert nach Erstellungsdatum, neueste zuerst)
   */
  async findAllByRole(
    user: User,
    filters?: {
      projectId?: string;
      status?: string;
      priority?: string;
      assigneeId?: string;
      labelId?: string;
      search?: string;
    }
  ): Promise<Ticket[]> {
    const isAdmin = user.role === UserRole.ADMIN;
    const isManager = user.role === UserRole.MANAGER;
    const isReporter = user.role === UserRole.REPORTER;
    const isDeveloper = user.role === UserRole.DEVELOPER;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereCondition: any = {};

    // Rollenbasierte Basis-Filterung
    if (isAdmin || isManager) {
      // Manager/Admin: Alle Tickets
      whereCondition = {};
    } else if (isReporter) {
      // Reporter: Nur selbst erstellte Tickets
      whereCondition = {
        reporterId: user.id,
      };
    } else if (isDeveloper) {
      // Developer: Selbst erstellte + Tickets aus Projekten wo Mitglied
      const projectMemberships = await this.prisma.projectMember.findMany({
        where: { userId: user.id },
        select: { projectId: true },
      });

      const projectIds = projectMemberships.map((pm) => pm.projectId);

      whereCondition = {
        OR: [
          { reporterId: user.id }, // Selbst erstellte
          { projectId: { in: projectIds } }, // Projekte wo Mitglied
        ],
      };
    }

    // Zusätzliche Filter anwenden
    if (filters?.projectId) {
      whereCondition.projectId = filters.projectId;
    }

    if (filters?.status) {
      whereCondition.status = filters.status;
    }

    if (filters?.priority) {
      whereCondition.priority = filters.priority;
    }

    if (filters?.assigneeId) {
      whereCondition.assigneeId = filters.assigneeId;
    }

    // Label-Filter: Tickets müssen mindestens dieses Label haben
    if (filters?.labelId) {
      whereCondition.ticketLabels = {
        some: {
          labelId: filters.labelId,
        },
      };
    }

    // Suchfilter: Durchsucht Titel und Beschreibung (case-insensitive)
    if (filters?.search) {
      whereCondition.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const tickets = await this.prisma.ticket.findMany({
      where: whereCondition,
      include: {
        ticketLabels: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((ticket) => this.mapPrismaToTicket(ticket));
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
      include: {
        ticketLabels: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Konvertiere Prisma-Tickets zu Shared-Types-Tickets
    return tickets.map((ticket) => this.mapPrismaToTicket(ticket));
  }

  /**
   * Einzelnes Ticket abrufen
   *
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @returns Ticket mit allen Details
   * @throws NotFoundException wenn Ticket nicht gefunden
   */
  async findOne(projectId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, projectId },
      include: {
        ticketLabels: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this project');
    }

    return this.mapPrismaToTicket(ticket);
  }

  /**
   * Ticket löschen
   *
   * @param user - Der angemeldete User
   * @param projectId - UUID des Projekts
   * @param ticketId - UUID des Tickets
   * @returns Gelöschtes Ticket
   * @throws NotFoundException wenn Ticket nicht gefunden
   */
  async remove(
    user: User,
    projectId: string,
    ticketId: string
  ): Promise<Ticket> {
    // Ticket laden und prüfen
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, projectId },
      include: {
        ticketLabels: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this project');
    }

    // Löschen
    const deletedTicket = await this.prisma.ticket.delete({
      where: { id: ticketId },
      include: {
        ticketLabels: true,
      },
    });

    return this.mapPrismaToTicket(deletedTicket);
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

      // Developer-Einschränkung: Darf nicht auf "closed" setzen
      if (
        user.role === UserRole.DEVELOPER &&
        updateTicketDto.status === TicketStatus.CLOSED
      ) {
        throw new ForbiddenException(
          'Developers cannot set ticket status to closed'
        );
      }

      updateData.status = updateTicketDto.status;

      // Log Status-Änderung
      await this.activityService.logStatusChange(
        ticketId,
        user.id,
        ticket.status as TicketStatus,
        updateTicketDto.status
      );
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
      let newAssigneeName: string | undefined;
      if (updateTicketDto.assigneeId !== null) {
        const assignee = await this.validateAssignee(
          projectId,
          updateTicketDto.assigneeId
        );
        newAssigneeName = assignee
          ? `${assignee.name} ${assignee.surname}`
          : undefined;
      }

      // Lade alten Assignee-Namen (falls vorhanden)
      let oldAssigneeName: string | undefined;
      if (ticket.assigneeId) {
        const oldAssignee = await this.prisma.user.findUnique({
          where: { id: ticket.assigneeId },
          select: { name: true, surname: true },
        });
        oldAssigneeName = oldAssignee
          ? `${oldAssignee.name} ${oldAssignee.surname}`
          : undefined;
      }

      updateData.assigneeId = updateTicketDto.assigneeId;

      // Log Assignee-Wechsel
      await this.activityService.logAssigneeChange(
        ticketId,
        user.id,
        ticket.assigneeId,
        updateTicketDto.assigneeId,
        oldAssigneeName,
        newAssigneeName
      );
    }

    // Labels: Validieren und ersetzen (falls angegeben)
    if (updateTicketDto.labelIds !== undefined) {
      // Lade alte Labels
      const oldLabels = await this.prisma.ticketLabel.findMany({
        where: { ticketId },
        include: { label: true },
      });
      const oldLabelIds = oldLabels.map((tl) => tl.labelId);

      if (updateTicketDto.labelIds.length > 0) {
        await this.validateLabels(projectId, updateTicketDto.labelIds);
      }

      // Alte Labels löschen, neue zuweisen
      updateData.ticketLabels = {
        deleteMany: {},
        create: updateTicketDto.labelIds.map((labelId) => ({ labelId })),
      };

      // Log Label-Änderungen
      // Entfernte Labels
      const removedLabelIds = oldLabelIds.filter(
        (id) => !updateTicketDto.labelIds?.includes(id)
      );
      for (const removedLabelId of removedLabelIds) {
        const label = oldLabels.find(
          (l) => l.labelId === removedLabelId
        )?.label;
        if (label) {
          await this.activityService.logLabelRemoved(
            ticketId,
            user.id,
            label.id,
            label.name,
            label.color
          );
        }
      }

      // Hinzugefügte Labels
      const addedLabelIds = updateTicketDto.labelIds.filter(
        (id) => !oldLabelIds.includes(id)
      );
      if (addedLabelIds.length > 0) {
        const addedLabels = await this.prisma.label.findMany({
          where: { id: { in: addedLabelIds } },
        });
        for (const label of addedLabels) {
          await this.activityService.logLabelAdded(
            ticketId,
            user.id,
            label.id,
            label.name,
            label.color
          );
        }
      }
    }

    // 4. Ticket aktualisieren
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        ticketLabels: true,
      },
    });

    return this.mapPrismaToTicket(updatedTicket);
  }

  /**
   * Validiert ob Labels zum Projekt gehören
   *
   * @param projectId - Projekt-ID
   * @param labelIds - Array von Label-IDs
   * @throws BadRequestException wenn Labels nicht zum Projekt gehören
   */
  private async validateLabels(
    projectId: string,
    labelIds: string[]
  ): Promise<void> {
    const labels = await this.prisma.label.findMany({
      where: {
        id: { in: labelIds },
        projectId,
      },
    });

    if (labels.length !== labelIds.length) {
      throw new BadRequestException(
        'One or more labels do not belong to this project'
      );
    }
  }

  /**
   * Validiert ob ein User als Assignee gesetzt werden kann
   *
   * @param projectId - Projekt-ID
   * @param assigneeId - User-ID des Assignees
   * @returns User-Daten des Assignees (name, surname)
   * @throws BadRequestException wenn Validierung fehlschlägt
   */
  private async validateAssignee(
    projectId: string,
    assigneeId: string
  ): Promise<{ name: string; surname: string } | null> {
    // User muss existieren
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
      select: { id: true, role: true, name: true, surname: true },
    });

    if (!assignee) {
      throw new BadRequestException('Assignee user not found');
    }

    // Reporter können nicht als Assignee gesetzt werden
    if (assignee.role === UserRole.REPORTER) {
      throw new BadRequestException('Reporters cannot be assigned to tickets');
    }

    // Prüfe ob Assignee Projektmitglied, Manager oder Admin ist
    // (Admin/Manager haben automatisch Zugriff, andere müssen Mitglied sein)
    if (
      assignee.role !== UserRole.ADMIN &&
      assignee.role !== UserRole.MANAGER
    ) {
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

    return { name: assignee.name, surname: assignee.surname };
  }
}
