import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';
import { User } from '@issue-tracker/shared-types';

/**
 * Guard für Projekt-Zugriffskontrolle
 *
 * Prüft, ob der authentifizierte User Zugriff auf ein spezifisches Projekt hat.
 *
 * Zugriffsberechtigung:
 * - ADMIN/MANAGER: Voller Zugriff auf alle Projekte
 * - DEVELOPER/REPORTER: Nur Zugriff auf Projekte mit Mitgliedschaft
 *
 * @remarks
 * Setzt voraus, dass CurrentUserGuard bereits gelaufen ist (request.user gesetzt).
 * Route muss Parameter 'id' oder 'projectId' haben.
 *
 * @throws {ForbiddenException} Wenn User kein Zugriff auf Projekt hat
 */
@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const projectId = this.extractProjectId(request.params);

    const hasAccess = await this.projectsService.hasProjectAccess(
      projectId,
      user.id
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Access denied. You are not a member of project '${projectId}'.`
      );
    }

    return true;
  }

  /**
   * Extrahiert Projekt-ID aus Route-Parametern
   *
   * @param params - Route-Parameter-Objekt
   * @returns Validierte Projekt-ID
   * @throws {ForbiddenException} Wenn kein Projekt-Parameter vorhanden
   *
   * @remarks
   * Unterstützt beide Patterns: /projects/:id und /projects/:projectId/...
   */
  private extractProjectId(params: Record<string, unknown>): string {
    const projectId = (params.id || params.projectId) as string | undefined;

    if (!projectId) {
      throw new ForbiddenException(
        'Project ID is required in route parameters. ' +
          'Expected route pattern: /projects/:id or /projects/:projectId/...'
      );
    }

    return projectId;
  }
}
