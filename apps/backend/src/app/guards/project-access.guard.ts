import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

/**
 * Guard zur Prüfung des Projektzugriffs
 *
 * Zugriffsberechtigung:
 * - Admins: Voller Zugriff auf alle Projekte
 * - Manager: Voller Zugriff auf alle Projekte
 * - Andere Rollen: Nur Zugriff auf Projekte, bei denen sie Mitglied sind
 */
@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Projekt-ID aus Route-Parameter
    const projectId = request.params.id || request.params.projectId;

    // User-ID aus Header (später aus JWT-Token)
    const userId = request.headers['x-user-id'];

    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    // Prüfe Projektzugriff
    const hasAccess = await this.projectsService.hasProjectAccess(
      projectId,
      userId
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied. You are not a member of this project.'
      );
    }

    return true;
  }
}
