"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IFixedAssetService } from "@/core/domain/services/IFixedAssetService";
import type { FixedAssetWriteDto } from "@/core/domain/repositories/IFixedAssetRepository";
import type { GetFixedAssetsParams } from "@/core/domain/repositories/IFixedAssetRepository";

const FIXED_ASSETS_QUERY_KEY = ["fixed-assets"];

export function useFixedAssets(params?: GetFixedAssetsParams) {
  return useQuery({
    queryKey: [
      ...FIXED_ASSETS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IFixedAssetService>("fixedAssetService");
      return service.getAll(params);
    },
  });
}

export function useFixedAsset(id: string | null) {
  return useQuery({
    queryKey: [...FIXED_ASSETS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IFixedAssetService>("fixedAssetService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FixedAssetWriteDto) => {
      const service = container.resolve<IFixedAssetService>("fixedAssetService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FIXED_ASSETS_QUERY_KEY });
    },
  });
}

export function useUpdateFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FixedAssetWriteDto }) => {
      const service = container.resolve<IFixedAssetService>("fixedAssetService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FIXED_ASSETS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...FIXED_ASSETS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IFixedAssetService>("fixedAssetService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FIXED_ASSETS_QUERY_KEY });
    },
  });
}
