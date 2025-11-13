// Generic API Response Wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Simple Message Response (z.B. für Health Checks)
export interface MessageResponse {
  message: string;
}

// Error Response
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Success Response Helper
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    data,
    message,
    success: true,
    timestamp: new Date().toISOString(),
  };
}

// Error Response Helper
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
  path?: string
): ApiError {
  return {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path,
  };
}

// Pagination Support
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: PaginationMeta;
}

// Query Parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Specific Filter Interfaces
export interface ProjectFilters extends PaginationQuery {
  status?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TicketFilters extends PaginationQuery {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  labelId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserFilters extends PaginationQuery {
  role?: string;
  active?: boolean;
}
