"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IExchangeRateService } from "@/core/domain/services/IExchangeRateService";
import type { ExchangeRateDto } from "@/core/application/dtos/ExchangeRateDto";
import type { GetExchangeRatesParams } from "@/core/domain/repositories/IExchangeRateRepository";

const EXCHANGE_RATES_QUERY_KEY = ["exchange-rates"];

export function useExchangeRates(params?: GetExchangeRatesParams) {
  return useQuery({
    queryKey: [
      ...EXCHANGE_RATES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IExchangeRateService>("exchangeRateService");
      return service.getAll(params);
    },
  });
}

export function useExchangeRate(id: string | null) {
  return useQuery({
    queryKey: [...EXCHANGE_RATES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IExchangeRateService>("exchangeRateService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
    ) => {
      const service = container.resolve<IExchangeRateService>("exchangeRateService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCHANGE_RATES_QUERY_KEY });
    },
  });
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">;
    }) => {
      const service = container.resolve<IExchangeRateService>("exchangeRateService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXCHANGE_RATES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...EXCHANGE_RATES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IExchangeRateService>("exchangeRateService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCHANGE_RATES_QUERY_KEY });
    },
  });
}
