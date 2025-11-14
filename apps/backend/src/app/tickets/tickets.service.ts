import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  Ticket as PrismaTicket,
  TicketPriority as PrismaTicketPriority,
} from '@prisma/client';
import {
  Ticket,
  CreateTicketDto,
  TicketStatus,
  TicketPriority,
} from '@issue-tracker/shared-types';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mapper: Shared-Types Priority → Prisma Priority
   */
  private mapPriorityToPrisma(priority: TicketPriority): PrismaTicketPriority {
    const mapping: Record<TicketPriority, PrismaTicketPriority> = {
      [TicketPriority.LOW]: 'LOW',
      [TicketPriority.MEDIUM]: 'MEDIUM',
      [TicketPriority.HIGH]: 'HIGH',
      [TicketPriority.CRITICAL]: 'CRITICAL',
    };
    return mapping[priority];
  }

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
      status: prismaTicket.status.toLowerCase() as TicketStatus,
      priority: prismaTicket.priority.toLowerCase() as TicketPriority,
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
      throw new Error('Project not found');
    }

    // 2. Prüfe ob Reporter (angemeldeter User) existiert
    const reporter = await this.prisma.user.findUnique({
      where: { id: reporterId },
      select: { id: true, role: true },
    });

    if (!reporter) {
      throw new Error('Reporter user not found');
    }

    // 3. Prüfe ob Reporter Zugriff auf Projekt hat (Mitglied, Manager oder Admin)
    const isAdmin = reporter.role === 'ADMIN';
    const isManager = reporter.role === 'MANAGER';
    const isDeveloper = reporter.role === 'DEVELOPER';
    const isReporter = reporter.role === 'REPORTER';

    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: reporterId,
        },
      },
    });

    if (!isAdmin && !isManager && !projectMember) {
      throw new Error(
        'User must be a project member, manager, or admin to create tickets'
      );
    }

    // 4. Rollenbasierte Berechtigungen anwenden
    let finalPriority: TicketPriority;
    let finalAssigneeId: string | null = null;

    if (isReporter) {
      // Reporter: Darf KEINE Priorität oder Assignee setzen
      if (createTicketDto.priority || createTicketDto.assigneeId) {
        throw new Error(
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
          throw new Error('Developers can only assign tickets to themselves');
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
        throw new Error('Assignee user not found');
      }

      // Reporter können nicht als Assignee gesetzt werden
      if (assignee.role === 'REPORTER') {
        throw new Error('Reporters cannot be assigned to tickets');
      }

      // Prüfe ob Assignee Projektmitglied, Manager oder Admin ist
      const isAssigneeAdmin = assignee.role === 'ADMIN';
      const isAssigneeManager = assignee.role === 'MANAGER';
      const isAssigneeMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: finalAssigneeId,
          },
        },
      });

      if (!isAssigneeAdmin && !isAssigneeManager && !isAssigneeMember) {
        throw new Error('Assignee must be a project member, manager, or admin');
      }
    }

    // 6. Erstelle Ticket mit korrektem Enum-Mapping und finalen Werten
    const ticket = await this.prisma.ticket.create({
      data: {
        projectId,
        reporterId, // Automatisch der angemeldete User
        assigneeId: finalAssigneeId,
        title: createTicketDto.title,
        description: createTicketDto.description,
        status: 'OPEN', // Prisma Enum: Immer OPEN bei Erstellung
        priority: this.mapPriorityToPrisma(finalPriority),
      },
    });

    // 7. Konvertiere Prisma-Ticket zu Shared-Types-Ticket
    return this.mapPrismaToTicket(ticket);
  }
}
