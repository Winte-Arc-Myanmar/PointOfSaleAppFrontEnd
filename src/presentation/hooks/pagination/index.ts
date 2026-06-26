import type { PaginatedResult } from "@/core/domain/types/pagination";

export type { PaginationControl } from "../usePagination";

export function getPaginatedItems<T>(
  result: PaginatedResult<T> | T[] | null | undefined,
): T[] {
  return Array.isArray(result) ? result : result?.items ?? [];
}

export function getPaginatedTotal<T>(
  result: PaginatedResult<T> | T[] | null | undefined,
): number {
  return Array.isArray(result) ? result.length : result?.total ?? 0;
}
