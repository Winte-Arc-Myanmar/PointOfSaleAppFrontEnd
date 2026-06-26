import type { PaginatedResult } from "@/core/domain/types/pagination";

interface ParsePaginationOptions {
  page: number;
  limit: number;
}

type PaginatedResponse<T> =
  | T[]
  | {
      items?: T[];
      data?: T[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
        totalItems?: number;
        currentPage?: number;
        perPage?: number;
      };
    };

function getNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function parsePaginatedResponse<T>(
  response: unknown,
  { page, limit }: ParsePaginationOptions,
): PaginatedResult<T> {
  const payload = response as PaginatedResponse<T>;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page,
      limit,
    };
  }

  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return {
    items,
    total: getNumber(
      payload?.total ?? payload?.meta?.total ?? payload?.meta?.totalItems,
      items.length,
    ),
    page: getNumber(payload?.page ?? payload?.meta?.page ?? payload?.meta?.currentPage, page),
    limit: getNumber(payload?.limit ?? payload?.meta?.limit ?? payload?.meta?.perPage, limit),
    totalPages: getNumber(payload?.totalPages ?? payload?.meta?.totalPages, 0) || undefined,
  };
}

export function mapPaginatedResult<TIn, TOut>(
  result: PaginatedResult<TIn>,
  mapper: (item: TIn) => TOut,
  predicate?: (item: TIn) => boolean,
): PaginatedResult<TOut> {
  const source = predicate ? result.items.filter(predicate) : result.items;

  return {
    ...result,
    items: source.map(mapper),
  };
}
