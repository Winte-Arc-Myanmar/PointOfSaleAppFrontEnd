"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { LoyaltyLedgerEntryDto } from "@/core/application/dtos/LoyaltyLedgerEntryDto";
import type { GetLoyaltyLedgerParams } from "@/core/domain/repositories/ILoyaltyLedgerRepository";
import type { ILoyaltyLedgerService } from "@/core/domain/services/ILoyaltyLedgerService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

const LOYALTY_LEDGER_QUERY_KEY = ["loyalty-ledger"];

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(err: unknown): number | null {
  const retryAfter = (err as any)?.response?.headers?.["retry-after"];
  if (retryAfter == null) return null;
  const asNumber = Number(retryAfter);
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber * 1000;
  const asDate = Date.parse(String(retryAfter));
  if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now());
  return null;
}

function isRateLimitError(err: unknown): boolean {
  return (err as any)?.response?.status === 429;
}

async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  opts?: { maxRetries?: number }
): Promise<T> {
  const maxRetries = opts?.maxRetries ?? 3;
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimitError(err) || attempt >= maxRetries) throw err;
      const retryAfterMs = getRetryAfterMs(err);
      const backoffMs =
        retryAfterMs ??
        Math.min(5000, 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250));
      attempt += 1;
      await sleep(backoffMs);
    }
  }
}

async function mapWithConcurrency<TIn, TOut>(
  items: readonly TIn[],
  concurrency: number,
  mapper: (item: TIn) => Promise<TOut>
): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const current = idx;
      idx += 1;
      results[current] = await mapper(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export function loyaltyLedgerQueryKey(
  customerId: string | null,
  params?: GetLoyaltyLedgerParams
) {
  return [
    ...LOYALTY_LEDGER_QUERY_KEY,
    customerId,
    params?.page,
    params?.limit,
  ] as const;
}

export function allCustomersLoyaltyLedgerQueryKey(customerIds: string[]) {
  return [...LOYALTY_LEDGER_QUERY_KEY, "all-customers", customerIds] as const;
}

function toLoyaltyEntryTimestamp(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

export function useAllCustomersLoyaltyLedgerEntries(
  customerIds: string[],
  params?: GetLoyaltyLedgerParams
) {
  return useQuery({
    queryKey: allCustomersLoyaltyLedgerQueryKey(customerIds),
    enabled: customerIds.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService"
      );
      // Avoid slamming the backend with N parallel requests (can cause 429).
      const lists = await mapWithConcurrency(customerIds, 5, (customerId) =>
        withRateLimitRetry(() => service.getAll(customerId, params))
      );
      const items = lists
        .flatMap((list) => list.items)
        .sort(
          (a, b) =>
            toLoyaltyEntryTimestamp(b.createdAt ?? b.updatedAt) -
            toLoyaltyEntryTimestamp(a.createdAt ?? a.updatedAt)
        );
      return {
        items,
        total: lists.reduce((sum, list) => sum + list.total, 0),
        page: params?.page ?? 1,
        limit: params?.limit ?? items.length,
      } satisfies PaginatedResult<(typeof items)[number]>;
    },
  });
}

export function useLoyaltyLedgerEntries(
  customerId: string | null,
  params?: GetLoyaltyLedgerParams
) {
  return useQuery({
    queryKey: loyaltyLedgerQueryKey(customerId, params),
    queryFn: () => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService"
      );
      return service.getAll(customerId!, params);
    },
    enabled: !!customerId,
  });
}

export function useLoyaltyLedgerEntry(
  customerId: string | null,
  entryId: string | null
) {
  return useQuery({
    queryKey: [...LOYALTY_LEDGER_QUERY_KEY, customerId, entryId],
    queryFn: () => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService"
      );
      return service.getById(customerId!, entryId!);
    },
    enabled: !!customerId && !!entryId,
  });
}

export function useCreateLoyaltyLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">;
    }) => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService"
      );
      return service.create(customerId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...LOYALTY_LEDGER_QUERY_KEY, variables.customerId],
      });
    },
  });
}

export function useUpdateLoyaltyLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      entryId,
      data,
    }: {
      customerId: string;
      entryId: string;
      data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">;
    }) => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService"
      );
      return service.update(customerId, entryId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...LOYALTY_LEDGER_QUERY_KEY, variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...LOYALTY_LEDGER_QUERY_KEY,
          variables.customerId,
          variables.entryId,
        ],
      });
    },
  });
}

export function useDeleteLoyaltyLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      entryId,
    }: {
      customerId: string;
      entryId: string;
    }) => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService"
      );
      return service.delete(customerId, entryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...LOYALTY_LEDGER_QUERY_KEY, variables.customerId],
      });
    },
  });
}
