import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
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
} from '@issue-tracker/shared-types';
import { RoleGuard } from '../guards/role.guard';
import { ProjectAccessGuard } from '../guards/project-access.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly labelsService: LabelsService
  ) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
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
    try {
      return await this.projectsService.create(createProjectDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
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
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    try {
      return await this.projectsService.update(id, updateProjectDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
  @Roles('admin')
  async adminUpdate(
    @Param('id') id: string,
    @Body(new ValidationPipe()) adminUpdateDto: AdminUpdateProjectDto
  ): Promise<Project> {
    try {
      return await this.projectsService.adminUpdate(id, adminUpdateDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<Project> {
    try {
      return await this.projectsService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Projektmitglieder abrufen
   * Nur Manager und Admins
   */
  @Get(':id/members')
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async getMembers(@Param('id') id: string) {
    try {
      return await this.projectsService.getProjectMembers(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Alle verfügbaren Benutzer abrufen (nicht-Mitglieder)
   * Ohne Suchfilter - gibt alle User zurück, die noch keine Mitglieder sind
   * Nur Manager und Admins
   */
  @Get(':id/members/available')
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async getAvailableMembers(@Param('id') id: string) {
    try {
      return await this.projectsService.getAvailableMembers(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Verfügbare Benutzer für Projekt suchen
   * Query Parameter: ?search=<suchbegriff>
   * Gibt nur User zurück, die noch KEINE Mitglieder sind
   * Nur Manager und Admins
   */
  @Get(':id/members/search')
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async searchAvailableMembers(
    @Param('id') id: string,
    @Query('search') searchQuery: string
  ) {
    try {
      if (!searchQuery) {
        throw new Error('Search query is required');
      }
      return await this.projectsService.searchAvailableMembers(id, searchQuery);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async addMember(
    @Param('id') id: string,
    @Body(new ValidationPipe()) addMemberDto: AddProjectMemberDto
  ): Promise<MessageResponse> {
    try {
      return await this.projectsService.addMember(id, addMemberDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Mitglied aus Projekt entfernen
   * Nur Manager und Admins
   */
  @Delete(':id/members/:userId')
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ): Promise<MessageResponse> {
    try {
      return await this.projectsService.removeMember(id, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
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
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async createLabel(
    @Param('id') projectId: string,
    @Body(new ValidationPipe()) createLabelDto: CreateLabelDto
  ): Promise<Label> {
    try {
      return await this.labelsService.create(projectId, createLabelDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
    try {
      return await this.labelsService.findAllByProject(projectId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async updateLabel(
    @Param('id') projectId: string,
    @Param('labelId') labelId: string,
    @Body(new ValidationPipe()) updateLabelDto: UpdateLabelDto
  ): Promise<Label> {
    try {
      return await this.labelsService.update(
        projectId,
        labelId,
        updateLabelDto
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
  @UseGuards(RoleGuard)
  @Roles('manager', 'admin')
  async deleteLabel(
    @Param('id') projectId: string,
    @Param('labelId') labelId: string
  ): Promise<Label> {
    try {
      return await this.labelsService.remove(projectId, labelId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
