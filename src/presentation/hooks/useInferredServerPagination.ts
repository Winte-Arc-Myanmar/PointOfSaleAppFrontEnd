"use client";

import { useCallback, useMemo, useState } from "react";
import type { PaginationControl } from "./pagination/types";

export interface InferredServerPaginationOptions {
  initialPage?: number;
  pageSize: number;
}

export interface InferredServerPaginationControl extends PaginationControl {
  /** TEMP: call after each fetch when API does not return `total`. */
  observePageResult: (itemsLength: number) => void;
}

/**
 * TEMPORARY — server-side pagination when the API does not return totals.
 *
 * Guesses "has next page" from whether the current response length equals `pageSize`.
 * Totals and page counts are approximate until the user visits later pages.
 *
 * Proper fix (server API type):
 * - Backend list endpoints return `PaginatedResult<T>` (`items`, `total`, `page`, `limit`).
 * - Repositories/services expose `PaginatedResult<T>` instead of `T[]`.
 * - Replace this hook with `useServerPagination` driven by API `total` / `totalPages`.
 *
 * @see src/core/domain/types/pagination.ts
 */
export function useInferredServerPagination({
  initialPage = 1,
  pageSize,
}: InferredServerPaginationOptions): InferredServerPaginationControl {
  const [page, setPage] = useState(initialPage);
  const [maxKnownPage, setMaxKnownPage] = useState(initialPage);
  const [lastPageSize, setLastPageSize] = useState<number>(0);

  const reset = useCallback(
    (nextPage: number = initialPage) => {
      setPage(nextPage);
      setMaxKnownPage(nextPage);
      setLastPageSize(0);
    },
    [initialPage],
  );

  const observePageResult = useCallback(
    (itemsLength: number) => {
      setLastPageSize(itemsLength);
      setMaxKnownPage((prev) => {
        const impliedMax = itemsLength >= pageSize ? page + 1 : page;
        return Math.max(prev, impliedMax);
      });
    },
    [page, pageSize],
  );

  const totalPages = maxKnownPage;
  const totalItems = useMemo(() => {
    return (page - 1) * pageSize + lastPageSize;
  }, [page, pageSize, lastPageSize]);

  return useMemo(
    () => ({
      page,
      setPage,
      totalPages,
      totalItems,
      observePageResult,
      reset,
      pageSize,
    }),
    [page, setPage, totalPages, totalItems, observePageResult, reset, pageSize],
  );
}
