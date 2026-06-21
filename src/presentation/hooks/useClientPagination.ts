"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaginationControl } from "./pagination/types";

export interface ClientPaginationOptions {
  pageSize: number;
  initialPage?: number;
}

export interface ClientPaginationControl<T> extends PaginationControl {
  /** Slice of `items` for the current page. */
  items: T[];
}

/**
 * TEMPORARY — client-side pagination over a full in-memory array.
 *
 * Used when the screen loads the entire dataset (or filters locally) instead of
 * requesting pages from the API. Does not scale for large lists.
 *
 * Proper fix (client-side list type):
 * - Move search/filter/sort/pagination to the backend (`PaginatedQueryParams`).
 * - Fetch one page via `PaginatedResult<T>` and use server pagination in the UI.
 * - Remove local slicing once CategoryList, hub all-customers lists, variant sections,
 *   and similar screens call paginated endpoints.
 *
 * Acceptable long-term only for small bounded sets (e.g. lines on a single order detail).
 *
 * @see src/core/domain/types/pagination.ts
 */
export function useClientPagination<T>(
  items: T[],
  { pageSize, initialPage = 1 }: ClientPaginationOptions,
): ClientPaginationControl<T> {
  const [page, setPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const reset = useCallback(
    (nextPage: number = initialPage) => {
      setPage(nextPage);
    },
    [initialPage],
  );

  return useMemo(
    () => ({
      page: safePage,
      setPage,
      totalPages,
      totalItems,
      items: paginatedItems,
      reset,
      pageSize,
    }),
    [safePage, totalPages, totalItems, paginatedItems, reset, pageSize],
  );
}
