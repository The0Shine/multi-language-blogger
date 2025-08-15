// Standardized API Response Models
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  errors?: any;
}

// New simplified pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// New paginated response format
export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: PaginationMeta;
}
