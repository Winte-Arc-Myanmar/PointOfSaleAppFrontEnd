"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { LoyaltyLedgerEntryDto } from "@/core/application/dtos/LoyaltyLedgerEntryDto";
import type { GetLoyaltyLedgerParams } from "@/core/domain/repositories/ILoyaltyLedgerRepository";
import type { ILoyaltyLedgerService } from "@/core/domain/services/ILoyaltyLedgerService";

const LOYALTY_LEDGER_QUERY_KEY = ["loyalty-ledger"];

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
