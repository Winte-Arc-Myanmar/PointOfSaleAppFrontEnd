"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ILocationService } from "@/core/domain/services/ILocationService";
import type { LocationDto } from "@/core/application/dtos/LocationDto";
import type { GetLocationsParams } from "@/core/domain/repositories/ILocationRepository";

const LOCATIONS_QUERY_KEY = ["locations"];
const LOCATIONS_TREE_QUERY_KEY = ["locations", "tree"];

export function useLocations(params?: GetLocationsParams) {
  return useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const service = container.resolve<ILocationService>("locationService");
      return service.getAll(params);
    },
  });
}

export function useLocationTree() {
  return useQuery({
    queryKey: LOCATIONS_TREE_QUERY_KEY,
    queryFn: () => {
      const service = container.resolve<ILocationService>("locationService");
      return service.getTree();
    },
  });
}

export function useLocation(id: string | null) {
  return useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ILocationService>("locationService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LocationDto, "id" | "subLocations">) => {
      const service = container.resolve<ILocationService>("locationService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LOCATIONS_TREE_QUERY_KEY });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<LocationDto, "id" | "subLocations">;
    }) => {
      const service = container.resolve<ILocationService>("locationService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LOCATIONS_TREE_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LOCATIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ILocationService>("locationService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LOCATIONS_TREE_QUERY_KEY });
    },
  });
}
