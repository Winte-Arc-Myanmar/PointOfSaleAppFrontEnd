"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IKdsStationService } from "@/core/domain/services/IKdsStationService";
import type {
  KdsStationCreateDto,
  KdsStationUpdateDto,
} from "@/core/application/dtos/KdsStationDto";
import type { GetKdsStationsParams } from "@/core/domain/repositories/IKdsStationRepository";

const KDS_STATIONS_QUERY_KEY = ["kds-stations"];

export function useKdsStations(params?: GetKdsStationsParams) {
  return useQuery({
    queryKey: [
      ...KDS_STATIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.locationId,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IKdsStationService>("kdsStationService");
      return service.getAll(params);
    },
  });
}

export function useKdsStation(id: string | null) {
  return useQuery({
    queryKey: [...KDS_STATIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IKdsStationService>("kdsStationService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateKdsStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KdsStationCreateDto) => {
      const service = container.resolve<IKdsStationService>("kdsStationService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KDS_STATIONS_QUERY_KEY });
    },
  });
}

export function useUpdateKdsStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KdsStationUpdateDto }) => {
      const service = container.resolve<IKdsStationService>("kdsStationService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KDS_STATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...KDS_STATIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteKdsStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IKdsStationService>("kdsStationService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KDS_STATIONS_QUERY_KEY });
    },
  });
}
