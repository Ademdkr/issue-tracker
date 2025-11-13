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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserPublic,
} from '@issue-tracker/shared-types';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto
  ): Promise<UserPublic> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(): Promise<UserPublic[]> {
    return this.usersService.findAll();
  }

  /**
   * User suchen
   * Query Parameter: ?search=<suchbegriff>
   * Beispiel: /api/users/search?search=max
   */
  @Get('search')
  async search(@Query('search') searchQuery: string): Promise<UserPublic[]> {
    if (!searchQuery) {
      throw new HttpException(
        'Search query is required',
        HttpStatus.BAD_REQUEST
      );
    }
    return this.usersService.searchUsers(searchQuery);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserPublic> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto
  ): Promise<UserPublic> {
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<UserPublic> {
    try {
      return await this.usersService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
