"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IUomClassService } from "@/core/domain/services/IUomClassService";
import type { UomClassDto } from "@/core/application/dtos/UomClassDto";
import type { GetUomClassesParams } from "@/core/domain/repositories/IUomClassRepository";

const UOM_CLASSES_QUERY_KEY = ["uom-classes"];

export function useUomClasses(params?: GetUomClassesParams) {
  return useQuery({
    queryKey: [...UOM_CLASSES_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const service = container.resolve<IUomClassService>("uomClassService");
      return service.getAll(params);
    },
  });
}

export function useUomClass(id: string | null) {
  return useQuery({
    queryKey: [...UOM_CLASSES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IUomClassService>("uomClassService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateUomClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<UomClassDto, "id">) => {
      const service = container.resolve<IUomClassService>("uomClassService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_CLASSES_QUERY_KEY });
    },
  });
}

export function useUpdateUomClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Omit<UomClassDto, "id"> }) => {
      const service = container.resolve<IUomClassService>("uomClassService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: UOM_CLASSES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...UOM_CLASSES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteUomClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IUomClassService>("uomClassService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_CLASSES_QUERY_KEY });
    },
  });
}
