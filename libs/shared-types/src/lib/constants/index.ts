/**
 * API Konstanten die von Backend und Frontend genutzt werden
 */

// API Routen
export const API_ROUTES = {
  PROJECTS: '/api/projects',
  USERS: '/api/users',
  TICKETS: '/api/tickets',
  LABELS: '/api/labels',
  COMMENTS: '/api/comments',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  PROJECT_NAME_MAX: 100,
  PROJECT_DESCRIPTION_MAX: 500,
  TICKET_TITLE_MAX: 200,
  USER_NAME_MAX: 50,
  PASSWORD_MIN: 6,
  SLUG_MAX: 50,
  LABEL_NAME_MAX: 50,
  COMMENT_MAX: 2000,
  COMMENT_CONTENT_MAX: 5000,
} as const;

// HTTP Status Messages
export const STATUS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Invalid request data',
  CONFLICT: 'Resource already exists',
  SERVER_ERROR: 'Internal server error',
} as const;

// Error Codes (für spezifische Fehlerbehandlung)
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED: 'ROLE_REQUIRED',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_UUID: 'INVALID_UUID',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // Business Logic
  SLUG_ALREADY_EXISTS: 'SLUG_ALREADY_EXISTS',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  PROJECT_NOT_EMPTY: 'PROJECT_NOT_EMPTY',
} as const;
