/**
 * Shared surface passed from pagination hooks to DataTable / EntityListWithCreateModal.
 * Both server and client hooks expose this shape today; only the data source differs.
 */
export interface PaginationControl {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  reset: (nextPage?: number) => void;
}
