"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  ApiSpaRepository,
  SpaListParams,
} from "@/core/infrastructure/repositories/ApiSpaRepository";
import type { SpaPackageInput, SpaRoomInput } from "@/core/domain/entities/Spa";

const PACKAGES = ["spa-packages"];
const ROOMS = ["spa-rooms"];
const repository = () => container.resolve<ApiSpaRepository>("spaRepository");

function useSpaMutation<V>(key: string[], fn: (vars: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export const useSpaPackages = (params?: SpaListParams) =>
  useQuery({
    queryKey: [...PACKAGES, params?.page, params?.limit, params?.search],
    queryFn: () => repository().listPackages(params),
  });

export const useSpaPackage = (id: string | null) =>
  useQuery({ queryKey: [...PACKAGES, id], queryFn: () => repository().getPackage(id!), enabled: !!id });

export const useCreateSpaPackage = () =>
  useSpaMutation(PACKAGES, (data: SpaPackageInput) => repository().createPackage(data));

export const useUpdateSpaPackage = () =>
  useSpaMutation(PACKAGES, ({ id, data }: { id: string; data: SpaPackageInput }) =>
    repository().updatePackage(id, data),
  );

export const useDeleteSpaPackage = () =>
  useSpaMutation(PACKAGES, (id: string) => repository().removePackage(id));

export const useSpaRooms = (params?: SpaListParams) =>
  useQuery({
    queryKey: [...ROOMS, params?.page, params?.limit, params?.search],
    queryFn: () => repository().listRooms(params),
  });

export const useSpaRoom = (id: string | null) =>
  useQuery({ queryKey: [...ROOMS, id], queryFn: () => repository().getRoom(id!), enabled: !!id });

export const useCreateSpaRoom = () =>
  useSpaMutation(ROOMS, (data: SpaRoomInput) => repository().createRoom(data));

export const useUpdateSpaRoom = () =>
  useSpaMutation(ROOMS, ({ id, data }: { id: string; data: Partial<SpaRoomInput> }) =>
    repository().updateRoom(id, data),
  );

export const useMarkSpaRoomReady = () =>
  useSpaMutation(ROOMS, (id: string) => repository().markRoomReady(id));

export const useDeleteSpaRoom = () =>
  useSpaMutation(ROOMS, (id: string) => repository().removeRoom(id));
