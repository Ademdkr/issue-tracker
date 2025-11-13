import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserPublic,
} from '@issue-tracker/shared-types';
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapSharedRoleToPrismaRole(role?: string): PrismaUserRole {
    if (!role) return 'REPORTER';

    switch (role) {
      case 'reporter':
        return 'REPORTER';
      case 'developer':
        return 'DEVELOPER';
      case 'manager':
        return 'MANAGER';
      case 'admin':
        return 'ADMIN';
      default:
        return 'REPORTER';
    }
  }

  private mapPrismaToUser(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      name: prismaUser.name,
      surname: prismaUser.surname,
      email: prismaUser.email,
      role: prismaUser.role as User['role'],
      createdAt: prismaUser.createdAt,
    };
  }

  private mapPrismaToUserPublic(prismaUser: PrismaUser): UserPublic {
    const user = this.mapPrismaToUser(prismaUser);
    return {
      ...user,
      fullName: `${user.name} ${user.surname}`.trim(),
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserPublic> {
    // Note: In production, hash the password with bcrypt
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        surname: createUserDto.surname,
        email: createUserDto.email,
        passwordHash: createUserDto.password, // TODO: Hash this!
        role: this.mapSharedRoleToPrismaRole(createUserDto.role),
      },
    });

    return this.mapPrismaToUserPublic(user);
  }

  async findAll(): Promise<UserPublic[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.mapPrismaToUserPublic(user));
  }

  /**
   * Sucht Benutzer nach Name, Vorname oder Email
   *
   * @param searchQuery - Suchbegriff (min. 2 Zeichen)
   * @returns Array von gefundenen Benutzern
   */
  async searchUsers(searchQuery: string): Promise<UserPublic[]> {
    // Mindestens 2 Zeichen für Suche erforderlich
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    const search = searchQuery.trim();

    // Suche nach Name, Vorname oder Email
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { surname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ name: 'asc' }, { surname: 'asc' }],
      take: 20, // Maximal 20 Ergebnisse
    });

    return users.map((user) => this.mapPrismaToUserPublic(user));
  }

  async findOne(id: string): Promise<UserPublic | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapPrismaToUserPublic(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserPublic> {
    const updateData: Record<string, unknown> = {};

    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.surname) updateData.surname = updateUserDto.surname;
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.role)
      updateData.role = this.mapSharedRoleToPrismaRole(updateUserDto.role);

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.mapPrismaToUserPublic(user);
  }

  async remove(id: string): Promise<UserPublic> {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return this.mapPrismaToUserPublic(user);
  }
}
