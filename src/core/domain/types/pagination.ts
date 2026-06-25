/** Contract for paginated list endpoints. */
export interface PaginatedResult<T> {
  items: T[];
  /** Total row count across all pages — required for accurate pagination. */
  total: number;
  page: number;
  limit: number;
  /** Optional server-provided page count. Preferred when available. */
  totalPages?: number;
}

/** Common query params for paginated list endpoints. */
export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
