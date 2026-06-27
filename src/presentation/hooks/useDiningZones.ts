"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IDiningZoneService } from "@/core/domain/services/IDiningZoneService";
import type {
  DiningZoneCreateDto,
  DiningZoneUpdateDto,
} from "@/core/application/dtos/DiningZoneDto";
import type { GetDiningZonesParams } from "@/core/domain/repositories/IDiningZoneRepository";

const DINING_ZONES_QUERY_KEY = ["dining-zones"];

export function useDiningZones(params?: GetDiningZonesParams) {
  return useQuery({
    queryKey: [
      ...DINING_ZONES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IDiningZoneService>("diningZoneService");
      return service.getAll(params);
    },
  });
}

export function useDiningZone(id: string | null) {
  return useQuery({
    queryKey: [...DINING_ZONES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IDiningZoneService>("diningZoneService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateDiningZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DiningZoneCreateDto) => {
      const service = container.resolve<IDiningZoneService>("diningZoneService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DINING_ZONES_QUERY_KEY });
    },
  });
}

export function useUpdateDiningZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiningZoneUpdateDto }) => {
      const service = container.resolve<IDiningZoneService>("diningZoneService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DINING_ZONES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...DINING_ZONES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteDiningZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IDiningZoneService>("diningZoneService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DINING_ZONES_QUERY_KEY });
    },
  });
}
