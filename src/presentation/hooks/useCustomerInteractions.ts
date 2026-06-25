"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { CustomerInteractionDto } from "@/core/application/dtos/CustomerInteractionDto";
import type { GetCustomerInteractionsParams } from "@/core/domain/repositories/ICustomerInteractionRepository";
import type { ICustomerInteractionService } from "@/core/domain/services/ICustomerInteractionService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

const CUSTOMER_INTERACTIONS_QUERY_KEY = ["customer-interactions"];

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

export function customerInteractionsQueryKey(
  customerId: string | null,
  params?: GetCustomerInteractionsParams
) {
  return [
    ...CUSTOMER_INTERACTIONS_QUERY_KEY,
    customerId,
    params?.page,
    params?.limit,
  ] as const;
}

export function allCustomersInteractionsQueryKey(customerIds: string[]) {
  return [
    ...CUSTOMER_INTERACTIONS_QUERY_KEY,
    "all-customers",
    customerIds,
  ] as const;
}

function toInteractionTimestamp(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

export function useAllCustomersCustomerInteractions(
  customerIds: string[],
  params?: GetCustomerInteractionsParams
) {
  return useQuery({
    queryKey: allCustomersInteractionsQueryKey(customerIds),
    enabled: customerIds.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      // Avoid slamming the backend with N parallel requests (can cause 429).
      const lists = await mapWithConcurrency(customerIds, 5, (customerId) =>
        withRateLimitRetry(() => service.getAll(customerId, params))
      );
      const items = lists
        .flatMap((list) => list.items)
        .sort(
          (a, b) =>
            toInteractionTimestamp(b.interactionDate ?? b.updatedAt) -
            toInteractionTimestamp(a.interactionDate ?? a.updatedAt)
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

export function useCustomerInteractions(
  customerId: string | null,
  params?: GetCustomerInteractionsParams
) {
  return useQuery({
    queryKey: customerInteractionsQueryKey(customerId, params),
    queryFn: () => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.getAll(customerId!, params);
    },
    enabled: !!customerId,
  });
}

export function useCustomerInteraction(
  customerId: string | null,
  interactionId: string | null
) {
  return useQuery({
    queryKey: [
      ...CUSTOMER_INTERACTIONS_QUERY_KEY,
      customerId,
      interactionId,
    ],
    queryFn: () => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.getById(customerId!, interactionId!);
    },
    enabled: !!customerId && !!interactionId,
  });
}

export function useCreateCustomerInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Omit<CustomerInteractionDto, "id" | "customerId">;
    }) => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.create(customerId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_INTERACTIONS_QUERY_KEY, variables.customerId],
      });
    },
  });
}

export function useUpdateCustomerInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      interactionId,
      data,
    }: {
      customerId: string;
      interactionId: string;
      data: Omit<CustomerInteractionDto, "id" | "customerId">;
    }) => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.update(customerId, interactionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_INTERACTIONS_QUERY_KEY, variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...CUSTOMER_INTERACTIONS_QUERY_KEY,
          variables.customerId,
          variables.interactionId,
        ],
      });
    },
  });
}

export function useDeleteCustomerInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      interactionId,
    }: {
      customerId: string;
      interactionId: string;
    }) => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.delete(customerId, interactionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_INTERACTIONS_QUERY_KEY, variables.customerId],
      });
    },
  });
}
