"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { BundleCreateDto, BundleUpdateDto } from "@/core/application/dtos/BundleDto";
import type { GetBundlesParams } from "@/core/domain/repositories/IBundleRepository";
import type { IBundleService } from "@/core/domain/services/IBundleService";

const BUNDLES_QUERY_KEY = ["bundles"];

export function useBundles(params?: GetBundlesParams) {
  return useQuery({
    queryKey: [
      ...BUNDLES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IBundleService>("bundleService");
      return service.getAll(params);
    },
  });
}

export function useBundle(id: string | null) {
  return useQuery({
    queryKey: [...BUNDLES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IBundleService>("bundleService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BundleCreateDto) => {
      const service = container.resolve<IBundleService>("bundleService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUNDLES_QUERY_KEY });
    },
  });
}

export function useUpdateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BundleUpdateDto }) => {
      const service = container.resolve<IBundleService>("bundleService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BUNDLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...BUNDLES_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IBundleService>("bundleService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUNDLES_QUERY_KEY });
    },
  });
}
