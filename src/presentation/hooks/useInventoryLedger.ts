"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IInventoryLedgerService } from "@/core/domain/services/IInventoryLedgerService";
import type {
  InventoryLedgerDto,
  InventoryLedgerWriteOffDto,
} from "@/core/application/dtos/InventoryLedgerDto";
import type {
  GetInventoryLedgerExpiringParams,
  GetInventoryLedgerParams,
} from "@/core/domain/repositories/IInventoryLedgerRepository";

const LEDGER_QUERY_KEY = ["inventory-ledger"];

export function useInventoryLedger(
  params?: GetInventoryLedgerParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...LEDGER_QUERY_KEY, "list", params?.page, params?.limit],
    queryFn: () => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.getAll(params);
    },
    enabled: options?.enabled ?? true,
  });
}

export function useInventoryLedgerExpiring(
  params?: GetInventoryLedgerExpiringParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [
      ...LEDGER_QUERY_KEY,
      "expiring",
      params?.page,
      params?.limit,
      params?.days,
    ],
    queryFn: () => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.getExpiring(params);
    },
    enabled: options?.enabled ?? true,
  });
}

export function useInventoryLedgerEntry(id: string | null) {
  return useQuery({
    queryKey: [...LEDGER_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateInventoryLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<InventoryLedgerDto, "id" | "createdAt">) => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY });
    },
  });
}

export function useWriteOffInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryLedgerWriteOffDto) => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.writeOff(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY });
    },
  });
}

export function useInventoryBalanceLookup() {
  return useMutation({
    mutationFn: ({
      variantId,
      locationId,
    }: {
      variantId: string;
      locationId: string;
    }) => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.getBalance(variantId, locationId);
    },
  });
}

export function useDeleteInventoryLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IInventoryLedgerService>(
        "inventoryLedgerService"
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY });
    },
  });
}
