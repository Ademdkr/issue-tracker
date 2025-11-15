import { Injectable } from '@nestjs/common';
import {
  User,
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
} from '@issue-tracker/shared-types';

/**
 * Zentraler Service für Authorization-Logic
 * Bietet Helper-Methoden für Berechtigungsprüfungen
 */
@Injectable()
export class AuthorizationService {
  /**
   * Prüft ob User eine bestimmte Permission hat
   *
   * @param user - Der User
   * @param permission - Die zu prüfende Permission
   * @returns true wenn User die Permission hat
   */
  hasPermission(user: User, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Prüft ob User mehrere Permissions hat
   *
   * @param user - Der User
   * @param permissions - Die zu prüfenden Permissions
   * @returns true wenn User ALLE Permissions hat
   */
  hasAllPermissions(user: User, ...permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(user, permission)
    );
  }

  /**
   * Prüft ob User mindestens eine Permission hat
   *
   * @param user - Der User
   * @param permissions - Die zu prüfenden Permissions
   * @returns true wenn User MINDESTENS EINE Permission hat
   */
  hasAnyPermission(user: User, ...permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(user, permission)
    );
  }

  /**
   * Prüft ob User eine der Rollen hat
   *
   * @param user - Der User
   * @param roles - Die zu prüfenden Rollen
   * @returns true wenn User eine der Rollen hat
   */
  hasRole(user: User, ...roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  /**
   * Gibt alle Permissions für eine Rolle zurück
   *
   * @param role - Die Rolle
   * @returns Array mit allen Permissions der Rolle
   */
  getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Prüft ob User Admin ist
   *
   * @param user - Der User
   * @returns true wenn User Admin ist
   */
  isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }

  /**
   * Prüft ob User Manager ist
   *
   * @param user - Der User
   * @returns true wenn User Manager ist
   */
  isManager(user: User): boolean {
    return user.role === UserRole.MANAGER;
  }

  /**
   * Prüft ob User Admin oder Manager ist
   *
   * @param user - Der User
   * @returns true wenn User Admin ODER Manager ist
   */
  isManagerOrAdmin(user: User): boolean {
    return this.isAdmin(user) || this.isManager(user);
  }

  /**
   * Prüft ob User Developer ist
   *
   * @param user - Der User
   * @returns true wenn User Developer ist
   */
  isDeveloper(user: User): boolean {
    return user.role === UserRole.DEVELOPER;
  }

  /**
   * Prüft ob User Reporter ist
   *
   * @param user - Der User
   * @returns true wenn User Reporter ist
   */
  isReporter(user: User): boolean {
    return user.role === UserRole.REPORTER;
  }
}
