import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';
import {
  DashboardStats,
  ProjectWithOpenTickets,
  RecentTicket,
  UserRole,
} from '@issue-tracker/shared-types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(
    userId: string,
    userRole: UserRole
  ): Promise<DashboardStats> {
    // Admin sieht alle Daten ohne Projektfilterung
    const isAdmin = userRole === UserRole.ADMIN;

    // Bestimme, welche Projekte der Benutzer sehen darf
    const accessibleProjectIds = isAdmin
      ? null
      : await this.getAccessibleProjectIds(userId, userRole);

    // Hole Ticket-Counts
    const ticketCounts = await this.getTicketCounts(accessibleProjectIds);

    // Hole Projekte mit offenen Tickets
    const projectsWithOpenTickets = await this.getProjectsWithOpenTickets(
      accessibleProjectIds
    );

    // Hole neueste Tickets
    const recentTickets = await this.getRecentTickets(accessibleProjectIds);

    return {
      ticketCounts,
      projectsWithOpenTickets,
      recentTickets,
    };
  }

  private async getAccessibleProjectIds(
    userId: string,
    userRole: UserRole
  ): Promise<string[]> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
      // Admin und Manager sehen alle Projekte
      const projects = await this.prisma.project.findMany({
        select: { id: true },
      });
      return projects.map((p) => p.id);
    } else if (userRole === UserRole.REPORTER) {
      // Reporter sieht nur eigene Projekte
      const projects = await this.prisma.project.findMany({
        where: { createdBy: userId },
        select: { id: true },
      });
      return projects.map((p) => p.id);
    } else if (userRole === UserRole.DEVELOPER) {
      // Developer sieht eigene + Projekte als Mitglied
      const projects = await this.prisma.project.findMany({
        where: {
          OR: [{ createdBy: userId }, { members: { some: { userId } } }],
        },
        select: { id: true },
      });
      return projects.map((p) => p.id);
    }
    return [];
  }

  private async getTicketCounts(projectIds: string[] | null) {
    const tickets = await this.prisma.ticket.findMany({
      where: projectIds ? { projectId: { in: projectIds } } : {},
      select: { status: true },
    });

    const counts = {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      total: tickets.length,
    };

    tickets.forEach((ticket) => {
      if (ticket.status === 'OPEN') counts.open++;
      if (ticket.status === 'IN_PROGRESS') counts.inProgress++;
      if (ticket.status === 'RESOLVED') counts.resolved++;
      if (ticket.status === 'CLOSED') counts.closed++;
    });

    return counts;
  }

  private async getProjectsWithOpenTickets(
    projectIds: string[] | null
  ): Promise<ProjectWithOpenTickets[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        ...(projectIds && { id: { in: projectIds } }),
        tickets: {
          some: {
            status: { in: ['OPEN', 'IN_PROGRESS'] },
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, surname: true },
        },
        tickets: {
          select: { status: true },
        },
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => {
      const ticketCounts = {
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        total: project.tickets.length,
      };

      project.tickets.forEach((ticket) => {
        if (ticket.status === 'OPEN') ticketCounts.open++;
        if (ticket.status === 'IN_PROGRESS') ticketCounts.inProgress++;
        if (ticket.status === 'RESOLVED') ticketCounts.resolved++;
        if (ticket.status === 'CLOSED') ticketCounts.closed++;
      });

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        ticketCounts,
        memberCount: project.members.length,
        createdBy: {
          id: project.creator.id,
          name: project.creator.name,
          surname: project.creator.surname,
        },
      };
    });
  }

  private async getRecentTickets(
    projectIds: string[] | null
  ): Promise<RecentTicket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: projectIds ? { projectId: { in: projectIds } } : {},
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        reporter: {
          select: { id: true, name: true, surname: true },
        },
        assignee: {
          select: { id: true, name: true, surname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      project: ticket.project,
      reporter: ticket.reporter,
      assignee: ticket.assignee || undefined,
    }));
  }
}
