"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  TipPoolCreateAllocationDto,
  TipPoolCreateDto,
  TipPoolUpdateAllocationDto,
  TipPoolUpdateDto,
} from "@/core/application/dtos/TipPoolDto";
import type {
  GetTipPoolAllocationsParams,
  GetTipPoolsParams,
} from "@/core/domain/repositories/ITipPoolRepository";
import type { ITipPoolService } from "@/core/domain/services/ITipPoolService";

const TIP_POOLS_QUERY_KEY = ["tip-pools"];

export function useTipPools(params?: GetTipPoolsParams) {
  return useQuery({
    queryKey: [
      ...TIP_POOLS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.locationId,
      params?.status,
      params?.fromDate,
      params?.toDate,
    ],
    queryFn: () => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.getAll(params);
    },
  });
}

export function useTipPool(id: string | null) {
  return useQuery({
    queryKey: [...TIP_POOLS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateTipPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TipPoolCreateDto) => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
    },
  });
}

export function useUpdateTipPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TipPoolUpdateDto }) => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TIP_POOLS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTipPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
    },
  });
}

function useTipPoolActionMutation(mutationFn: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TIP_POOLS_QUERY_KEY, id] });
    },
  });
}

export function useDistributeTipPool() {
  return useTipPoolActionMutation((id) => {
    const service = container.resolve<ITipPoolService>("tipPoolService");
    return service.distribute(id);
  });
}

export function useSettleTipPool() {
  return useTipPoolActionMutation((id) => {
    const service = container.resolve<ITipPoolService>("tipPoolService");
    return service.settle(id);
  });
}

export function useTipPoolAllocations(
  id: string | null,
  params?: GetTipPoolAllocationsParams,
) {
  return useQuery({
    queryKey: [
      ...TIP_POOLS_QUERY_KEY,
      id,
      "allocations",
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.getAllocations(id!, params);
    },
    enabled: !!id,
  });
}

export function useAddTipPoolAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TipPoolCreateAllocationDto }) => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.addAllocation(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TIP_POOLS_QUERY_KEY, variables.id, "allocations"],
      });
    },
  });
}

export function useUpdateTipPoolAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      allocationId,
      data,
    }: {
      id: string;
      allocationId: string;
      data: TipPoolUpdateAllocationDto;
    }) => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.updateAllocation(id, allocationId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TIP_POOLS_QUERY_KEY, variables.id, "allocations"],
      });
    },
  });
}

export function useRemoveTipPoolAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, allocationId }: { id: string; allocationId: string }) => {
      const service = container.resolve<ITipPoolService>("tipPoolService");
      return service.removeAllocation(id, allocationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TIP_POOLS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TIP_POOLS_QUERY_KEY, variables.id, "allocations"],
      });
    },
  });
}
