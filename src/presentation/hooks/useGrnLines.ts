"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IGrnLineService } from "@/core/domain/services/IGrnLineService";
import type {
  GetGrnLinesParams,
  GrnLineWriteDto,
} from "@/core/domain/repositories/IGrnLineRepository";

const GRN_LINES_QUERY_KEY = ["grn-lines"];

export function useGrnLines(grnId: string | null, params?: GetGrnLinesParams) {
  return useQuery({
    queryKey: [
      ...GRN_LINES_QUERY_KEY,
      grnId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IGrnLineService>("grnLineService");
      return service.getAll(grnId!, params);
    },
    enabled: !!grnId,
  });
}

export function useGrnLine(grnId: string | null, lineId: string | null) {
  return useQuery({
    queryKey: [...GRN_LINES_QUERY_KEY, grnId, lineId],
    queryFn: () => {
      const service = container.resolve<IGrnLineService>("grnLineService");
      return service.getById(grnId!, lineId!);
    },
    enabled: !!grnId && !!lineId,
  });
}

export function useCreateGrnLine(grnId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GrnLineWriteDto) => {
      const service = container.resolve<IGrnLineService>("grnLineService");
      return service.create(grnId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRN_LINES_QUERY_KEY });
    },
  });
}

export function useUpdateGrnLine(grnId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GrnLineWriteDto }) => {
      const service = container.resolve<IGrnLineService>("grnLineService");
      return service.update(grnId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: GRN_LINES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...GRN_LINES_QUERY_KEY, grnId, variables.id],
      });
    },
  });
}

export function useDeleteGrnLine(grnId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IGrnLineService>("grnLineService");
      return service.delete(grnId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRN_LINES_QUERY_KEY });
    },
  });
}
