"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPosSessionService } from "@/core/domain/services/IPosSessionService";
import type {
  PosSessionDto,
  ClosePosSessionRequestDto,
} from "@/core/application/dtos/PosSessionDto";
import type { GetPosSessionsParams } from "@/core/domain/repositories/IPosSessionRepository";

const POS_SESSIONS_QUERY_KEY = ["pos-sessions"];

export function usePosSessions(params?: GetPosSessionsParams) {
  return useQuery({
    queryKey: [
      ...POS_SESSIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.getAll(params);
    },
  });
}

export function usePosSession(id: string | null) {
  return useQuery({
    queryKey: [...POS_SESSIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePosSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">) => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_SESSIONS_QUERY_KEY });
    },
  });
}

export function useUpdatePosSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">;
    }) => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: POS_SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...POS_SESSIONS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeletePosSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_SESSIONS_QUERY_KEY });
    },
  });
}

export function useClosePosSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClosePosSessionRequestDto }) => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.close(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: POS_SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...POS_SESSIONS_QUERY_KEY, variables.id] });
    },
  });
}

export function usePosSessionSummary(id: string | null) {
  return useQuery({
    queryKey: [...POS_SESSIONS_QUERY_KEY, id, "summary"],
    queryFn: () => {
      const service = container.resolve<IPosSessionService>("posSessionService");
      return service.getSummary(id!);
    },
    enabled: !!id,
  });
}

