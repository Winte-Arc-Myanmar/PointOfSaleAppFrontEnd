"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  ApiKtvRoomRepository,
  GetKtvRoomsParams,
} from "@/core/infrastructure/repositories/ApiKtvRoomRepository";
import type { KtvRoomInput } from "@/core/domain/entities/KtvRoom";

const QUERY_KEY = ["ktv-rooms"];
const repository = () => container.resolve<ApiKtvRoomRepository>("ktvRoomRepository");

export function useKtvRooms(params?: GetKtvRoomsParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, params?.page, params?.limit, params?.search, params?.locationId],
    queryFn: () => repository().getAll(params),
  });
}

export function useKtvRoom(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => repository().getById(id!),
    enabled: !!id,
  });
}

function useRoomMutation<V>(fn: (vars: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export const useCreateKtvRoom = () =>
  useRoomMutation((data: KtvRoomInput) => repository().create(data));

export const useUpdateKtvRoom = () =>
  useRoomMutation(({ id, data }: { id: string; data: Partial<KtvRoomInput> }) =>
    repository().update(id, data),
  );

export const useMarkKtvRoomReady = () =>
  useRoomMutation((id: string) => repository().markReady(id));

export const useDeleteKtvRoom = () => useRoomMutation((id: string) => repository().remove(id));
