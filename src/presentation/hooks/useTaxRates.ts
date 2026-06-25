"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITaxRateService } from "@/core/domain/services/ITaxRateService";
import type { TaxRateDto } from "@/core/application/dtos/TaxRateDto";
import type { GetTaxRatesParams } from "@/core/domain/repositories/ITaxRateRepository";

const TAX_RATES_QUERY_KEY = ["tax-rates"];

export function useTaxRates(params?: GetTaxRatesParams) {
  return useQuery({
    queryKey: [
      ...TAX_RATES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ITaxRateService>("taxRateService");
      return service.getAll(params);
    },
  });
}

export function useTaxRate(id: string | null) {
  return useQuery({
    queryKey: [...TAX_RATES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ITaxRateService>("taxRateService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
    ) => {
      const service = container.resolve<ITaxRateService>("taxRateService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_RATES_QUERY_KEY });
    },
  });
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">;
    }) => {
      const service = container.resolve<ITaxRateService>("taxRateService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TAX_RATES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TAX_RATES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ITaxRateService>("taxRateService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_RATES_QUERY_KEY });
    },
  });
}
