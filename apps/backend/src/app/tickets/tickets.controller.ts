/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, UseInterceptors, Get, Query } from '@nestjs/common';
import { CurrentUserInterceptor } from '../common/interceptors';
import { TicketsService } from '../tickets/tickets.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, Ticket } from '@issue-tracker/shared-types';

@Controller('tickets')
@UseInterceptors(CurrentUserInterceptor)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Alle Tickets abrufen (rollenbasiert gefiltert)
   * GET /api/tickets
   *
   * Filterlogik:
   * - Manager/Admin: Alle Tickets
   * - Reporter: Nur selbst erstellte Tickets (reporterId = currentUser.id)
   * - Developer: Selbst erstellte + Tickets aus Projekten wo User Mitglied ist
   *
   * Query-Parameter (alle optional):
   * - projectId: Filtern nach Projekt-ID
   * - status: Filtern nach Status (open, in_progress, resolved, closed)
   * - priority: Filtern nach Priorität (low, medium, high, critical)
   * - assigneeId: Filtern nach Assignee-ID
   * - labelId: Filtern nach Label-ID
   * - search: Suchbegriff für Titel/Beschreibung
   */
  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('labelId') labelId?: string,
    @Query('search') search?: string
  ): Promise<Ticket[]> {
    return await this.ticketsService.findAllByRole(user, {
      projectId,
      status,
      priority,
      assigneeId,
      labelId,
      search,
    });
  }
}
