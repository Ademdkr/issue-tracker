import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';
import {
  TicketActivity,
  TicketActivityType,
  TicketStatus,
} from '@issue-tracker/shared-types';
import { TicketActivity as PrismaTicketActivity } from '@prisma/client';

/**
 * TicketActivitiesService
 * Verantwortlich für das Logging von Ticket-Aktivitäten
 */
@Injectable()
export class TicketActivitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mapper: Prisma TicketActivity → Shared-Types TicketActivity
   */
  private mapPrismaToActivity(
    prismaActivity: PrismaTicketActivity
  ): TicketActivity {
    return {
      id: prismaActivity.id,
      ticketId: prismaActivity.ticketId,
      actorId: prismaActivity.actorId,
      activityType: prismaActivity.activityType as TicketActivityType,
      detail: prismaActivity.detail as {
        oldValue?: string | null;
        newValue?: string | null;
        [key: string]: unknown;
      },
      createdAt: prismaActivity.createdAt,
    };
  }

  /**
   * Alle Aktivitäten eines Tickets abrufen
   *
   * @param ticketId - UUID des Tickets
   * @returns Array von Aktivitäten (sortiert nach Erstellungsdatum, neueste zuerst)
   */
  async findAllByTicket(ticketId: string): Promise<TicketActivity[]> {
    const activities = await this.prisma.ticketActivity.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });

    return activities.map((a) => this.mapPrismaToActivity(a));
  }

  /**
   * Status-Änderung loggen
   *
   * Detail-Format:
   * {
   *   oldValue: "OPEN",
   *   newValue: "IN_PROGRESS"
   * }
   *
   * @param ticketId - UUID des Tickets
   * @param actorId - UUID des Users der die Änderung durchgeführt hat
   * @param oldStatus - Alter Status
   * @param newStatus - Neuer Status
   */
  async logStatusChange(
    ticketId: string,
    actorId: string,
    oldStatus: TicketStatus | null,
    newStatus: TicketStatus
  ): Promise<TicketActivity> {
    const activity = await this.prisma.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        activityType: TicketActivityType.STATUS_CHANGE,
        detail: {
          oldValue: oldStatus,
          newValue: newStatus,
        },
      },
    });

    return this.mapPrismaToActivity(activity);
  }

  /**
   * Assignee-Wechsel loggen
   *
   * Detail-Format:
   * {
   *   oldValue: "uuid-of-old-assignee" | null,
   *   newValue: "uuid-of-new-assignee" | null,
   *   oldAssigneeName: "Max Mustermann",
   *   newAssigneeName: "Erika Musterfrau"
   * }
   *
   * @param ticketId - UUID des Tickets
   * @param actorId - UUID des Users der die Änderung durchgeführt hat
   * @param oldAssigneeId - UUID des alten Assignees (null wenn nicht zugewiesen)
   * @param newAssigneeId - UUID des neuen Assignees (null wenn entfernt)
   * @param oldAssigneeName - Name des alten Assignees (optional, für bessere Lesbarkeit)
   * @param newAssigneeName - Name des neuen Assignees (optional, für bessere Lesbarkeit)
   */
  async logAssigneeChange(
    ticketId: string,
    actorId: string,
    oldAssigneeId: string | null,
    newAssigneeId: string | null,
    oldAssigneeName?: string,
    newAssigneeName?: string
  ): Promise<TicketActivity> {
    const detail: Record<string, unknown> = {
      oldValue: oldAssigneeId,
      newValue: newAssigneeId,
    };

    if (oldAssigneeName) {
      detail.oldAssigneeName = oldAssigneeName;
    }

    if (newAssigneeName) {
      detail.newAssigneeName = newAssigneeName;
    }

    const activity = await this.prisma.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        activityType: TicketActivityType.ASSIGNEE_CHANGE,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detail: detail as any,
      },
    });

    return this.mapPrismaToActivity(activity);
  }

  /**
   * Label hinzugefügt loggen
   *
   * Detail-Format:
   * {
   *   labelId: "uuid-of-label",
   *   labelName: "Bug",
   *   labelColor: "#ff0000"
   * }
   *
   * @param ticketId - UUID des Tickets
   * @param actorId - UUID des Users der die Änderung durchgeführt hat
   * @param labelId - UUID des Labels
   * @param labelName - Name des Labels
   * @param labelColor - Farbe des Labels (optional)
   */
  async logLabelAdded(
    ticketId: string,
    actorId: string,
    labelId: string,
    labelName: string,
    labelColor?: string
  ): Promise<TicketActivity> {
    const detail: Record<string, unknown> = {
      labelId,
      labelName,
    };

    if (labelColor) {
      detail.labelColor = labelColor;
    }

    const activity = await this.prisma.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        activityType: TicketActivityType.LABEL_ADDED,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detail: detail as any,
      },
    });

    return this.mapPrismaToActivity(activity);
  }

  /**
   * Label entfernt loggen
   *
   * Detail-Format:
   * {
   *   labelId: "uuid-of-label",
   *   labelName: "Bug",
   *   labelColor: "#ff0000"
   * }
   *
   * @param ticketId - UUID des Tickets
   * @param actorId - UUID des Users der die Änderung durchgeführt hat
   * @param labelId - UUID des Labels
   * @param labelName - Name des Labels
   * @param labelColor - Farbe des Labels (optional)
   */
  async logLabelRemoved(
    ticketId: string,
    actorId: string,
    labelId: string,
    labelName: string,
    labelColor?: string
  ): Promise<TicketActivity> {
    const detail: Record<string, unknown> = {
      labelId,
      labelName,
    };

    if (labelColor) {
      detail.labelColor = labelColor;
    }

    const activity = await this.prisma.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        activityType: TicketActivityType.LABEL_REMOVED,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detail: detail as any,
      },
    });

    return this.mapPrismaToActivity(activity);
  }
}
