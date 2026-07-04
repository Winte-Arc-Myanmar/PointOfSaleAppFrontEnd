"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  DiscountReasonCreateDto,
  DiscountReasonUpdateDto,
} from "@/core/application/dtos/DiscountReasonDto";
import type { GetDiscountReasonsParams } from "@/core/domain/repositories/IDiscountReasonRepository";
import type { IDiscountReasonService } from "@/core/domain/services/IDiscountReasonService";

const DISCOUNT_REASONS_QUERY_KEY = ["discount-reasons"];

export function useDiscountReasons(params?: GetDiscountReasonsParams) {
  return useQuery({
    queryKey: [
      ...DISCOUNT_REASONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
      params?.activeOnly,
    ],
    queryFn: () => {
      const service = container.resolve<IDiscountReasonService>("discountReasonService");
      return service.getAll(params);
    },
  });
}

export function useDiscountReason(id: string | null) {
  return useQuery({
    queryKey: [...DISCOUNT_REASONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IDiscountReasonService>("discountReasonService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateDiscountReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DiscountReasonCreateDto) => {
      const service = container.resolve<IDiscountReasonService>("discountReasonService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_REASONS_QUERY_KEY });
    },
  });
}

export function useUpdateDiscountReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountReasonUpdateDto }) => {
      const service = container.resolve<IDiscountReasonService>("discountReasonService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_REASONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...DISCOUNT_REASONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteDiscountReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IDiscountReasonService>("discountReasonService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_REASONS_QUERY_KEY });
    },
  });
}
