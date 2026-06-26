"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IDepreciationScheduleService } from "@/core/domain/services/IDepreciationScheduleService";
import type {
  GetDepreciationSchedulesParams,
  DepreciationScheduleWriteDto,
} from "@/core/domain/repositories/IDepreciationScheduleRepository";

const DEPRECIATION_SCHEDULES_QUERY_KEY = ["depreciation-schedules"];

export function useDepreciationSchedules(
  fixedAssetId: string | null,
  params?: GetDepreciationSchedulesParams
) {
  return useQuery({
    queryKey: [
      ...DEPRECIATION_SCHEDULES_QUERY_KEY,
      fixedAssetId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IDepreciationScheduleService>(
        "depreciationScheduleService"
      );
      return service.getAll(fixedAssetId!, params);
    },
    enabled: !!fixedAssetId,
  });
}

export function useDepreciationSchedule(
  fixedAssetId: string | null,
  scheduleId: string | null
) {
  return useQuery({
    queryKey: [...DEPRECIATION_SCHEDULES_QUERY_KEY, fixedAssetId, scheduleId],
    queryFn: () => {
      const service = container.resolve<IDepreciationScheduleService>(
        "depreciationScheduleService"
      );
      return service.getById(fixedAssetId!, scheduleId!);
    },
    enabled: !!fixedAssetId && !!scheduleId,
  });
}

export function useCreateDepreciationSchedule(fixedAssetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DepreciationScheduleWriteDto) => {
      const service = container.resolve<IDepreciationScheduleService>(
        "depreciationScheduleService"
      );
      return service.create(fixedAssetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPRECIATION_SCHEDULES_QUERY_KEY });
    },
  });
}

export function useUpdateDepreciationSchedule(fixedAssetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepreciationScheduleWriteDto }) => {
      const service = container.resolve<IDepreciationScheduleService>(
        "depreciationScheduleService"
      );
      return service.update(fixedAssetId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DEPRECIATION_SCHEDULES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...DEPRECIATION_SCHEDULES_QUERY_KEY, fixedAssetId, variables.id],
      });
    },
  });
}

export function useDeleteDepreciationSchedule(fixedAssetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IDepreciationScheduleService>(
        "depreciationScheduleService"
      );
      return service.delete(fixedAssetId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPRECIATION_SCHEDULES_QUERY_KEY });
    },
  });
}
