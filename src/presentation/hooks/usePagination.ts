"use client";

import { useCallback, useMemo, useState } from "react";

export interface PaginationOptions {
  pageSize: number;
  initialPage?: number;
}

export interface PaginationControl {
  page: number;
  setPage: (page: number) => void;
  reset: (nextPage?: number) => void;
  pageSize: number;
  getTotalPages: (totalItems?: number | null) => number;
}

export function getTotalPages(totalItems: number | null | undefined, pageSize: number) {
  return Math.max(1, Math.ceil((totalItems ?? 0) / pageSize));
}

/**
 * Single pagination state hook for API-backed list endpoints.
 *
 * Data must come from paginated endpoints returning `PaginatedResult<T>`.
 * This hook owns only page state; the API response owns rows and totals.
 */
export function usePagination({
  pageSize,
  initialPage = 1,
}: PaginationOptions): PaginationControl {
  const [page, setPageState] = useState(initialPage);

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const reset = useCallback(
    (nextPage: number = initialPage) => {
      setPage(nextPage);
    },
    [initialPage, setPage],
  );

  const getTotalPagesForPageSize = useCallback(
    (totalItems?: number | null) => getTotalPages(totalItems, pageSize),
    [pageSize],
  );

  return useMemo(
    () => ({
      page,
      setPage,
      reset,
      pageSize,
      getTotalPages: getTotalPagesForPageSize,
    }),
    [page, setPage, reset, pageSize, getTotalPagesForPageSize],
  );
}
