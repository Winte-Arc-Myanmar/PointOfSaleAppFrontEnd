/**
 * Target contract for paginated list endpoints.
 *
 * TODO (proper fix): Most list APIs currently return a bare array (or `{ data: T[] }`)
 * without `total`. The frontend uses inferred server pagination as a temporary workaround.
 * Backend and repositories should adopt this shape so the UI can show exact page counts.
 */
export interface PaginatedResult<T> {
  items: T[];
  /** Total row count across all pages — required for accurate pagination. */
  total: number;
  page: number;
  limit: number;
}

/** Common query params for paginated list endpoints. */
export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
