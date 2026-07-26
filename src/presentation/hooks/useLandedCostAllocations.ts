"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ILandedCostAllocationService } from "@/core/domain/services/ILandedCostAllocationService";
import type {
  GetLandedCostAllocationsParams,
  LandedCostAllocationWriteDto,
} from "@/core/domain/repositories/ILandedCostAllocationRepository";

const LANDED_COST_ALLOCATIONS_QUERY_KEY = ["landed-cost-allocations"];

export function useLandedCostAllocations(
  params?: GetLandedCostAllocationsParams,
) {
  return useQuery({
    queryKey: [
      ...LANDED_COST_ALLOCATIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ILandedCostAllocationService>(
        "landedCostAllocationService",
      );
      return service.getAll(params);
    },
  });
}

export function useLandedCostAllocation(id: string | null) {
  return useQuery({
    queryKey: [...LANDED_COST_ALLOCATIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ILandedCostAllocationService>(
        "landedCostAllocationService",
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateLandedCostAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LandedCostAllocationWriteDto) => {
      const service = container.resolve<ILandedCostAllocationService>(
        "landedCostAllocationService",
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LANDED_COST_ALLOCATIONS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateLandedCostAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: LandedCostAllocationWriteDto;
    }) => {
      const service = container.resolve<ILandedCostAllocationService>(
        "landedCostAllocationService",
      );
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LANDED_COST_ALLOCATIONS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...LANDED_COST_ALLOCATIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteLandedCostAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ILandedCostAllocationService>(
        "landedCostAllocationService",
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LANDED_COST_ALLOCATIONS_QUERY_KEY,
      });
    },
  });
}
