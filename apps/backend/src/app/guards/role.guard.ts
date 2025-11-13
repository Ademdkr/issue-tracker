import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@issue-tracker/shared-types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.body?.createdBy || request.headers['x-user-id'];

    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    // Get user from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Map Prisma role to shared-types role
    const userRole = user.role.toLowerCase() as UserRole;

    // Check if user has required role
    const hasRole = requiredRoles.some(
      (role) =>
        role.toLowerCase() === userRole ||
        (role.toLowerCase() === 'manager' && userRole === 'admin') // Admin can do manager actions
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
