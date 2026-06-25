"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IAccountingPeriodService } from "@/core/domain/services/IAccountingPeriodService";
import type { AccountingPeriodDto } from "@/core/application/dtos/AccountingPeriodDto";
import type { GetAccountingPeriodsParams } from "@/core/domain/repositories/IAccountingPeriodRepository";

const ACCOUNTING_PERIODS_QUERY_KEY = ["accounting-periods"];

export function useAccountingPeriods(params?: GetAccountingPeriodsParams) {
  return useQuery({
    queryKey: [
      ...ACCOUNTING_PERIODS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service =
        container.resolve<IAccountingPeriodService>("accountingPeriodService");
      return service.getAll(params);
    },
  });
}

export function useAccountingPeriod(id: string | null) {
  return useQuery({
    queryKey: [...ACCOUNTING_PERIODS_QUERY_KEY, id],
    queryFn: () => {
      const service =
        container.resolve<IAccountingPeriodService>("accountingPeriodService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateAccountingPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
    ) => {
      const service =
        container.resolve<IAccountingPeriodService>("accountingPeriodService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_PERIODS_QUERY_KEY });
    },
  });
}

export function useUpdateAccountingPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">;
    }) => {
      const service =
        container.resolve<IAccountingPeriodService>("accountingPeriodService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_PERIODS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ACCOUNTING_PERIODS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteAccountingPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service =
        container.resolve<IAccountingPeriodService>("accountingPeriodService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_PERIODS_QUERY_KEY });
    },
  });
}
