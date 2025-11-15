import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { LabelsService } from '../labels/labels.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AdminUpdateProjectDto,
  Project,
  AddProjectMemberDto,
  MessageResponse,
  CreateLabelDto,
  UpdateLabelDto,
  Label,
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
  User,
  UserRole,
} from '@issue-tracker/shared-types';
import { RoleGuard, ProjectAccessGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PoliciesGuard, CheckPolicies } from '../common/guards/policies.guard';
import {
  UpdateTicketPolicyHandler,
  DeleteTicketPolicyHandler,
  UpdateProjectPolicyHandler,
  DeleteProjectPolicyHandler,
  ManageProjectMembersPolicyHandler,
  CreateLabelPolicyHandler,
  UpdateLabelPolicyHandler,
  DeleteLabelPolicyHandler,
} from '../authorization/policies';
import { TicketsService } from '../tickets/tickets.service';
import { CurrentUserInterceptor } from '../common/interceptors';
import { UseInterceptors } from '@nestjs/common';

@Controller('projects')
@UseInterceptors(CurrentUserInterceptor) // User aus x-user-id Header laden
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly labelsService: LabelsService,
    private readonly ticketsService: TicketsService
  ) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  /**
   * Body (JSON):
   * {
   *   "name": "Logistik-Portal",
   *   "description": "Portal für Logistikverwaltung",
   *   "createdBy": "<uuid-des-erstellers>" // muss Manager oder Admin sein
   * }
   */
  async create(
    @Body(new ValidationPipe()) createProjectDto: CreateProjectDto
  ): Promise<Project> {
    return await this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  /**
   * Einzelnes Projekt abrufen
   * Nur Projektmitglieder, Manager und Admins haben Zugriff
   */
  @Get(':id')
  @UseGuards(ProjectAccessGuard)
  async findOne(@Param('id') id: string): Promise<Project> {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  /**
   * Projekt bearbeiten (Manager/Admin)
   * Erlaubte Felder: name, description
   *
   * Body (JSON):
   * {
   *   "name": "Neuer Projektname" (optional),
   *   "description": "Aktualisierte Beschreibung" (optional)
   * }
   */
  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(UpdateProjectPolicyHandler)
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    return await this.projectsService.update(id, updateProjectDto);
  }

  /**
   * Projekt mit Admin-Rechten bearbeiten
   * Erlaubte Felder: name, description, slug
   *
   * Body (JSON):
   * {
   *   "name": "Neuer Projektname" (optional),
   *   "description": "Aktualisierte Beschreibung" (optional),
   *   "slug": "CUSTOM-SLUG" (optional, nur Admin, eindeutig)
   * }
   */
  @Patch(':id/admin')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async adminUpdate(
    @Param('id') id: string,
    @Body(new ValidationPipe()) adminUpdateDto: AdminUpdateProjectDto
  ): Promise<Project> {
    return await this.projectsService.adminUpdate(id, adminUpdateDto);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(DeleteProjectPolicyHandler)
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string
  ): Promise<Project> {
    return await this.projectsService.remove(id);
  }

  /**
   * Projektmitglieder abrufen
   * Nur Manager und Admins
   */
  @Get(':id/members')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ManageProjectMembersPolicyHandler)
  async getMembers(@CurrentUser() user: User, @Param('id') id: string) {
    return await this.projectsService.getProjectMembers(id);
  }

  /**
   * Alle verfügbaren Benutzer abrufen (nicht-Mitglieder)
   * Ohne Suchfilter - gibt alle User zurück, die noch keine Mitglieder sind
   * Nur Manager und Admins
   */
  @Get(':id/members/available')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ManageProjectMembersPolicyHandler)
  async getAvailableMembers(
    @CurrentUser() user: User,
    @Param('id') id: string
  ) {
    return await this.projectsService.getAvailableMembers(id);
  }

  /**
   * Verfügbare Benutzer für Projekt suchen
   * Query Parameter: ?search=<suchbegriff>
   * Gibt nur User zurück, die noch KEINE Mitglieder sind
   * Nur Manager und Admins
   */
  @Get(':id/members/search')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ManageProjectMembersPolicyHandler)
  async searchAvailableMembers(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('search') searchQuery: string
  ) {
    if (!searchQuery) {
      throw new BadRequestException('Search query is required');
    }
    return await this.projectsService.searchAvailableMembers(id, searchQuery);
  }

  /**
   * Mitglied zu Projekt hinzufügen
   * Nur Manager und Admins
   *
   * Body (JSON):
   * {
   *   "userId": "<uuid-des-benutzers>",
   *   "addedBy": "<uuid-des-hinzufügenden-users>" // i.d.R. aktueller Manager/Admin
   * }
   */
  @Post(':id/members')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ManageProjectMembersPolicyHandler)
  async addMember(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body(new ValidationPipe()) addMemberDto: AddProjectMemberDto
  ): Promise<MessageResponse> {
    return await this.projectsService.addMember(id, addMemberDto);
  }

  /**
   * Mitglied aus Projekt entfernen
   * Nur Manager und Admins
   */
  @Delete(':id/members/:userId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ManageProjectMembersPolicyHandler)
  async removeMember(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('userId') userId: string
  ): Promise<MessageResponse> {
    return await this.projectsService.removeMember(id, userId);
  }

  // ==================== LABELS ====================

  /**
   * Label für Projekt erstellen
   * POST /api/projects/:id/labels
   *
   * Body (JSON):
   * {
   *   "name": "Bug",
   *   "color": "#FF0000"
   * }
   *
   * Nur Manager und Admins
   */
  @Post(':id/labels')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(CreateLabelPolicyHandler)
  async createLabel(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Body(new ValidationPipe()) createLabelDto: CreateLabelDto
  ): Promise<Label> {
    return await this.labelsService.create(projectId, createLabelDto);
  }

  /**
   * Alle Labels eines Projekts abrufen
   * GET /api/projects/:id/labels
   *
   * Kein Body erforderlich
   *
   * Alle Projektmitglieder + Manager/Admin
   */
  @Get(':id/labels')
  @UseGuards(ProjectAccessGuard)
  async getProjectLabels(@Param('id') projectId: string): Promise<Label[]> {
    return await this.labelsService.findAllByProject(projectId);
  }

  /**
   * Label aktualisieren
   * PATCH /api/projects/:id/labels/:labelId
   *
   * Body (JSON - alle Felder optional):
   * {
   *   "name": "Critical Bug",
   *   "color": "#FF0000"
   * }
   *
   * Nur Manager und Admins
   */
  @Patch(':id/labels/:labelId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(UpdateLabelPolicyHandler)
  async updateLabel(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Param('labelId') labelId: string,
    @Body(new ValidationPipe()) updateLabelDto: UpdateLabelDto
  ): Promise<Label> {
    return await this.labelsService.update(projectId, labelId, updateLabelDto);
  }

  /**
   * Label löschen
   * DELETE /api/projects/:id/labels/:labelId
   *
   * Kein Body erforderlich
   *
   * Nur Manager und Admins
   */
  @Delete(':id/labels/:labelId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(DeleteLabelPolicyHandler)
  async deleteLabel(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Param('labelId') labelId: string
  ): Promise<Label> {
    return await this.labelsService.remove(projectId, labelId);
  }

  // ==================== TICKETS ====================

  /**
   * Ticket für ein Projekt erstellen
   * POST /api/projects/:id/tickets
   *
   * Body:
   * {
   *   "title": "Bug: Login funktioniert nicht",
   *   "description": "Beim Einloggen erscheint eine Fehlermeldung",
   *   "priority": "HIGH",        // Optional (nur Developer/Manager/Admin)
   *   "assigneeId": "uuid"       // Optional (Developer: nur sich selbst, Manager/Admin: beliebig)
   * }
   *
   * Reporter wird automatisch aus x-user-id Header gesetzt
   *
   * Berechtigungen:
   * - Reporter: Kann nur title/description setzen
   * - Developer: Kann zusätzlich priority setzen und sich selbst zuweisen
   * - Manager/Admin: Können alles setzen
   */
  @Post(':id/tickets')
  @UseGuards(ProjectAccessGuard)
  async createTicket(
    @Param('id') projectId: string,
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: User
  ) {
    return this.ticketsService.create(projectId, user.id, createTicketDto);
  }

  @Get(':id/tickets')
  @UseGuards(ProjectAccessGuard)
  async getProjectTickets(@Param('id') projectId: string): Promise<Ticket[]> {
    return await this.ticketsService.findAllByProject(projectId);
  }

  /**
   * Einzelnes Ticket abrufen
   * GET /api/projects/:id/tickets/:ticketId
   *
   * Zeigt alle Details eines Tickets:
   * - Titel, Beschreibung, Status, Priorität
   * - Assignee, Projekt, Labels
   * - Erstellt am, Aktualisiert am, Erstellt von
   *
   * Zugriff: Alle Projektmitglieder + Manager/Admin
   */
  @Get(':id/tickets/:ticketId')
  @UseGuards(ProjectAccessGuard)
  async getTicketDetails(
    @Param('id') projectId: string,
    @Param('ticketId') ticketId: string
  ): Promise<Ticket> {
    return await this.ticketsService.findOne(projectId, ticketId);
  }

  /**
   * Ticket aktualisieren
   * PATCH /api/projects/:id/tickets/:ticketId
   *
   * Body (JSON) - Alle Felder optional:
   * {
   *   "title": "Neuer Titel",
   *   "description": "Neue Beschreibung",
   *   "status": "in_progress",     // open, in_progress, resolved, closed
   *   "priority": "high",           // low, medium, high, critical
   *   "assigneeId": "uuid" | null   // null zum Entfernen
   * }
   *
   * Berechtigungen werden durch Policies geprüft:
   * - Reporter (Ersteller): Nur title/description des eigenen Tickets
   * - Developer (Assignee): Kann status/priority ändern, sich selbst zuweisen/entfernen
   * - Manager/Admin: Können alles ändern
   */
  @Patch(':id/tickets/:ticketId')
  @UseGuards(ProjectAccessGuard, PoliciesGuard)
  @CheckPolicies(UpdateTicketPolicyHandler)
  async updateTicket(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Param('ticketId') ticketId: string,
    @Body(new ValidationPipe()) updateTicketDto: UpdateTicketDto
  ): Promise<Ticket> {
    return await this.ticketsService.update(
      user,
      projectId,
      ticketId,
      updateTicketDto
    );
  }

  /**
   * Ticket löschen
   * DELETE /api/projects/:id/tickets/:ticketId
   *
   * Berechtigungen:
   * - Reporter: Nur eigene Tickets
   * - Developer: Eigene oder zugewiesene Tickets
   * - Manager/Admin: Alle Tickets
   */
  @Delete(':id/tickets/:ticketId')
  @UseGuards(ProjectAccessGuard, PoliciesGuard)
  @CheckPolicies(DeleteTicketPolicyHandler)
  async deleteTicket(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Param('ticketId') ticketId: string
  ): Promise<Ticket> {
    return await this.ticketsService.remove(user, projectId, ticketId);
  }
}
