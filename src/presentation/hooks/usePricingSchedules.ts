"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  PricingScheduleCreateDto,
  PricingScheduleUpdateDto,
} from "@/core/application/dtos/PricingScheduleDto";
import type { GetPricingSchedulesParams } from "@/core/domain/repositories/IPricingScheduleRepository";
import type { IPricingScheduleService } from "@/core/domain/services/IPricingScheduleService";

const PRICING_SCHEDULES_QUERY_KEY = ["pricing-schedules"];

export function usePricingSchedules(params?: GetPricingSchedulesParams) {
  return useQuery({
    queryKey: [
      ...PRICING_SCHEDULES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IPricingScheduleService>("pricingScheduleService");
      return service.getAll(params);
    },
  });
}

export function usePricingSchedule(id: string | null) {
  return useQuery({
    queryKey: [...PRICING_SCHEDULES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IPricingScheduleService>("pricingScheduleService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePricingSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PricingScheduleCreateDto) => {
      const service = container.resolve<IPricingScheduleService>("pricingScheduleService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_SCHEDULES_QUERY_KEY });
    },
  });
}

export function useUpdatePricingSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PricingScheduleUpdateDto }) => {
      const service = container.resolve<IPricingScheduleService>("pricingScheduleService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRICING_SCHEDULES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PRICING_SCHEDULES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeletePricingSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IPricingScheduleService>("pricingScheduleService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_SCHEDULES_QUERY_KEY });
    },
  });
}
