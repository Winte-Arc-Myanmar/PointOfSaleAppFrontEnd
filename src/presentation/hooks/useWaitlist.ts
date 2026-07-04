"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  WaitlistCreateDto,
  WaitlistSeatDto,
  WaitlistUpdateDto,
} from "@/core/application/dtos/WaitlistDto";
import type { GetWaitlistParams } from "@/core/domain/repositories/IWaitlistRepository";
import type { IWaitlistService } from "@/core/domain/services/IWaitlistService";

const WAITLIST_QUERY_KEY = ["waitlist"];

export function useWaitlist(params?: GetWaitlistParams) {
  return useQuery({
    queryKey: [
      ...WAITLIST_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.locationId,
      params?.status,
      params?.activeOnly,
    ],
    queryFn: () => {
      const service = container.resolve<IWaitlistService>("waitlistService");
      return service.getAll(params);
    },
  });
}

export function useWaitlistEntry(id: string | null) {
  return useQuery({
    queryKey: [...WAITLIST_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IWaitlistService>("waitlistService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateWaitlistEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WaitlistCreateDto) => {
      const service = container.resolve<IWaitlistService>("waitlistService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAITLIST_QUERY_KEY });
    },
  });
}

export function useUpdateWaitlistEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WaitlistUpdateDto }) => {
      const service = container.resolve<IWaitlistService>("waitlistService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WAITLIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...WAITLIST_QUERY_KEY, variables.id] });
    },
  });
}

function useWaitlistActionMutation(mutationFn: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: WAITLIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...WAITLIST_QUERY_KEY, id] });
    },
  });
}

export function useNotifyWaitlistEntry() {
  return useWaitlistActionMutation((id) => {
    const service = container.resolve<IWaitlistService>("waitlistService");
    return service.notify(id);
  });
}

export function useCancelWaitlistEntry() {
  return useWaitlistActionMutation((id) => {
    const service = container.resolve<IWaitlistService>("waitlistService");
    return service.cancel(id);
  });
}

export function useNoShowWaitlistEntry() {
  return useWaitlistActionMutation((id) => {
    const service = container.resolve<IWaitlistService>("waitlistService");
    return service.noShow(id);
  });
}

export function useSeatWaitlistEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WaitlistSeatDto }) => {
      const service = container.resolve<IWaitlistService>("waitlistService");
      return service.seat(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WAITLIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...WAITLIST_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
    },
  });
}
