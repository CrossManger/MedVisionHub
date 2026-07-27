export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
  error?: string;
  details?: string;
}
