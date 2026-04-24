"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IChartOfAccountService } from "@/core/domain/services/IChartOfAccountService";
import type { ChartOfAccountDto } from "@/core/application/dtos/ChartOfAccountDto";
import type { GetChartOfAccountsParams } from "@/core/domain/repositories/IChartOfAccountRepository";

const CHART_OF_ACCOUNTS_QUERY_KEY = ["chart-of-accounts"];

export function useChartOfAccounts(params?: GetChartOfAccountsParams) {
  return useQuery({
    queryKey: [
      ...CHART_OF_ACCOUNTS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service =
        container.resolve<IChartOfAccountService>("chartOfAccountService");
      return service.getAll(params);
    },
  });
}

export function useChartOfAccount(id: string | null) {
  return useQuery({
    queryKey: [...CHART_OF_ACCOUNTS_QUERY_KEY, id],
    queryFn: () => {
      const service =
        container.resolve<IChartOfAccountService>("chartOfAccountService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateChartOfAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
    ) => {
      const service =
        container.resolve<IChartOfAccountService>("chartOfAccountService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHART_OF_ACCOUNTS_QUERY_KEY });
    },
  });
}

export function useUpdateChartOfAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">;
    }) => {
      const service =
        container.resolve<IChartOfAccountService>("chartOfAccountService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CHART_OF_ACCOUNTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CHART_OF_ACCOUNTS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteChartOfAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service =
        container.resolve<IChartOfAccountService>("chartOfAccountService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHART_OF_ACCOUNTS_QUERY_KEY });
    },
  });
}

