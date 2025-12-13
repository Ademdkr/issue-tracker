import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserPublic,
  UserRole,
} from '@issue-tracker/shared-types';
import { RoleGuard } from '../auth';
import { Roles } from '../auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Neuen User erstellen
   * Nur für Admins
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto
  ): Promise<UserPublic> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Alle User abrufen
   * Authentifizierung erforderlich
   */
  @Get()
  async findAll(): Promise<UserPublic[]> {
    return this.usersService.findAll();
  }

  // /**
  //  * Alle Projektmitglieder eines Projekts abrufen
  //  * Authentifizierung erforderlich
  //  */
  // @Get('project/:projectId/members')
  // async findAllProjectMembers(
  //   @Param('projectId') projectId: string
  // ): Promise<UserPublic[]> {
  //   return this.usersService.findAllProjectMembers(projectId);
  // }

  /**
   * User suchen
   * Query Parameter: ?search=<suchbegriff>
   * Beispiel: /api/users/search?search=max
   * Authentifizierung erforderlich
   */
  @Get('search')
  async search(@Query('search') searchQuery: string): Promise<UserPublic[]> {
    if (!searchQuery) {
      throw new BadRequestException('Search query is required');
    }
    return this.usersService.searchUsers(searchQuery);
  }

  /**
   * Einzelnen User abrufen
   * Authentifizierung erforderlich
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserPublic> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * User aktualisieren
   * Nur für Admins
   */
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto
  ): Promise<UserPublic> {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * User löschen
   * Nur für Admins
   */
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<UserPublic> {
    return await this.usersService.remove(id);
  }
}
