/**
 * Granulare Permissions für das System
 */
export enum Permission {
  // Ticket Permissions
  CREATE_TICKET = 'create:ticket',
  READ_TICKET = 'read:ticket',
  UPDATE_TICKET = 'update:ticket',
  DELETE_TICKET = 'delete:ticket',
  ASSIGN_TICKET = 'assign:ticket',
  SET_TICKET_PRIORITY = 'set:ticket:priority',
  SET_TICKET_STATUS = 'set:ticket:status',

  // Project Permissions
  CREATE_PROJECT = 'create:project',
  READ_PROJECT = 'read:project',
  UPDATE_PROJECT = 'update:project',
  DELETE_PROJECT = 'delete:project',
  MANAGE_PROJECT_MEMBERS = 'manage:project:members',

  // Label Permissions
  CREATE_LABEL = 'create:label',
  UPDATE_LABEL = 'update:label',
  DELETE_LABEL = 'delete:label',

  // User Permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
}

/**
 * Role-Permission-Mapping
 * Definiert welche Rolle welche Permissions hat
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Admin hat alle Permissions

  MANAGER: [
    Permission.CREATE_PROJECT,
    Permission.READ_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.MANAGE_PROJECT_MEMBERS,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET,
    Permission.UPDATE_TICKET,
    Permission.DELETE_TICKET,
    Permission.ASSIGN_TICKET,
    Permission.SET_TICKET_PRIORITY,
    Permission.SET_TICKET_STATUS,
    Permission.CREATE_LABEL,
    Permission.UPDATE_LABEL,
    Permission.DELETE_LABEL,
    Permission.READ_USER,
  ],

  DEVELOPER: [
    Permission.READ_PROJECT,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET,
    Permission.UPDATE_TICKET,
    Permission.ASSIGN_TICKET, // Nur sich selbst
    Permission.SET_TICKET_PRIORITY,
    Permission.SET_TICKET_STATUS,
    Permission.READ_USER,
  ],

  REPORTER: [
    Permission.READ_PROJECT,
    Permission.CREATE_TICKET,
    Permission.READ_TICKET,
    Permission.UPDATE_TICKET, // Nur eigene Tickets, nur title/description
  ],
};
