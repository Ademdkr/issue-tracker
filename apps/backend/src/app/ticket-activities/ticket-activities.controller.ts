import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TicketActivitiesService } from './ticket-activities.service';
import { RoleGuard, ProjectAccessGuard } from '../auth';
import { TicketActivityWithActor } from '@issue-tracker/shared-types';

/**
 * Ticket Activities Controller
 *
 * Nested unter Projects/Tickets:
 * - Alle Routen erfordern Projektzugriff (ProjectAccessGuard)
 * - Alle Routen erfordern mindestens REPORTER-Rolle
 *
 * Routen:
 * - GET /api/projects/:projectId/tickets/:ticketId/activities
 */
@Controller('projects/:projectId/tickets/:ticketId/activities')
@UseGuards(RoleGuard, ProjectAccessGuard)
export class TicketActivitiesController {
  constructor(private readonly activityService: TicketActivitiesService) {}

  /**
   * Alle Aktivitäten eines Tickets abrufen
   * GET /api/projects/:projectId/tickets/:ticketId/activities
   *
   * Berechtigungen:
   * - Alle Rollen können Aktivitäten lesen, wenn sie Zugriff aufs Projekt haben
   *
   * Rückgabe:
   * - Status-Änderungen mit: Wer, Von welchem Status zu welchem, Wann
   * - Assignee-Wechsel mit: Wer, Von wem zu wem, Wann
   * - Label hinzugefügt/entfernt mit: Wer, Wann, Was (Label-Name, -Farbe)
   */
  @Get()
  async findAll(
    @Param('ticketId', ParseUUIDPipe) ticketId: string
  ): Promise<TicketActivityWithActor[]> {
    return await this.activityService.findAllByTicket(ticketId);
  }
}
