"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IReconciliationMatchService } from "@/core/domain/services/IReconciliationMatchService";
import type { ReconciliationMatchWriteDto } from "@/core/domain/repositories/IReconciliationMatchRepository";
import type { GetReconciliationMatchesParams } from "@/core/domain/repositories/IReconciliationMatchRepository";

const RECONCILIATION_MATCHES_QUERY_KEY = ["reconciliation-matches"];

export function useReconciliationMatches(params?: GetReconciliationMatchesParams) {
  return useQuery({
    queryKey: [
      ...RECONCILIATION_MATCHES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IReconciliationMatchService>(
        "reconciliationMatchService"
      );
      return service.getAll(params);
    },
  });
}

export function useReconciliationMatch(id: string | null) {
  return useQuery({
    queryKey: [...RECONCILIATION_MATCHES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IReconciliationMatchService>(
        "reconciliationMatchService"
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateReconciliationMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReconciliationMatchWriteDto) => {
      const service = container.resolve<IReconciliationMatchService>(
        "reconciliationMatchService"
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECONCILIATION_MATCHES_QUERY_KEY });
    },
  });
}

export function useUpdateReconciliationMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReconciliationMatchWriteDto }) => {
      const service = container.resolve<IReconciliationMatchService>(
        "reconciliationMatchService"
      );
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RECONCILIATION_MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...RECONCILIATION_MATCHES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteReconciliationMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IReconciliationMatchService>(
        "reconciliationMatchService"
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECONCILIATION_MATCHES_QUERY_KEY });
    },
  });
}
