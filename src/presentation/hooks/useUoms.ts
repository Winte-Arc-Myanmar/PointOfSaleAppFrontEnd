"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IUomService } from "@/core/domain/services/IUomService";
import type { UomDto } from "@/core/application/dtos/UomDto";
import type { GetUomsParams } from "@/core/domain/repositories/IUomRepository";

const UOMS_QUERY_KEY = ["uoms"];

export function useUoms(params?: GetUomsParams) {
  return useQuery({
    queryKey: [...UOMS_QUERY_KEY, params?.page, params?.limit, params?.classId],
    queryFn: () => {
      const service = container.resolve<IUomService>("uomService");
      return service.getAll(params);
    },
  });
}

export function useUom(id: string | null) {
  return useQuery({
    queryKey: [...UOMS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IUomService>("uomService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateUom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<UomDto, "id">) => {
      const service = container.resolve<IUomService>("uomService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOMS_QUERY_KEY });
    },
  });
}

export function useUpdateUom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Omit<UomDto, "id"> }) => {
      const service = container.resolve<IUomService>("uomService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: UOMS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...UOMS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteUom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IUomService>("uomService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOMS_QUERY_KEY });
    },
  });
}
