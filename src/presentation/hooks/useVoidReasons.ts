"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  VoidReasonCreateDto,
  VoidReasonUpdateDto,
} from "@/core/application/dtos/VoidReasonDto";
import type { GetVoidReasonsParams } from "@/core/domain/repositories/IVoidReasonRepository";
import type { IVoidReasonService } from "@/core/domain/services/IVoidReasonService";

const VOID_REASONS_QUERY_KEY = ["void-reasons"];

export function useVoidReasons(params?: GetVoidReasonsParams) {
  return useQuery({
    queryKey: [
      ...VOID_REASONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
      params?.activeOnly,
    ],
    queryFn: () => {
      const service = container.resolve<IVoidReasonService>("voidReasonService");
      return service.getAll(params);
    },
  });
}

export function useVoidReason(id: string | null) {
  return useQuery({
    queryKey: [...VOID_REASONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IVoidReasonService>("voidReasonService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateVoidReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VoidReasonCreateDto) => {
      const service = container.resolve<IVoidReasonService>("voidReasonService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOID_REASONS_QUERY_KEY });
    },
  });
}

export function useUpdateVoidReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidReasonUpdateDto }) => {
      const service = container.resolve<IVoidReasonService>("voidReasonService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VOID_REASONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...VOID_REASONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteVoidReason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IVoidReasonService>("voidReasonService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOID_REASONS_QUERY_KEY });
    },
  });
}
