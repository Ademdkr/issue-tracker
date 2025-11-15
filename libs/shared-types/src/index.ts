// Export everything from the structured shared-types library

// Enums - First to avoid circular dependencies
export * from './lib/enums';

// Models - Domain entities
export * from './lib/models';

// DTOs - Data Transfer Objects for API
export * from './lib/dtos';

// API - Response types and filters
export * from './lib/api';

// Utils - Helper functions and utilities
export * from './lib/utils';

// Constants - Shared constants between backend and frontend
export * from './lib/constants';

// Authorization - Permissions and authorization types
export * from './lib/authorization';

// Note: Legacy shared-types.ts removed to avoid export conflicts
