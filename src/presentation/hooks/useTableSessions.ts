"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITableSessionService } from "@/core/domain/services/ITableSessionService";
import type {
  GetTableSessionsParams,
} from "@/core/domain/repositories/ITableSessionRepository";
import type {
  TableSessionAddLineDto,
  TableSessionAllocateSeatDto,
  TableSessionCheckoutDto,
  TableSessionCreateDto,
  TableSessionStateTransitionDto,
  TableSessionUpdateDto,
} from "@/core/application/dtos/TableSessionDto";

const TABLE_SESSIONS_QUERY_KEY = ["table-sessions"];

export function useTableSessions(params?: GetTableSessionsParams) {
  return useQuery({
    queryKey: [
      ...TABLE_SESSIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.tableId,
      params?.waiterId,
      params?.sessionState,
      params?.openOnly,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.getAll(params);
    },
  });
}

export function useTableSession(id: string | null) {
  return useQuery({
    queryKey: [...TABLE_SESSIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateTableSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TableSessionCreateDto) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_SESSIONS_QUERY_KEY });
    },
  });
}

export function useUpdateTableSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableSessionUpdateDto }) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TABLE_SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TABLE_SESSIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useTransitionTableSessionState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableSessionStateTransitionDto }) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.transitionState(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TABLE_SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TABLE_SESSIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useAddTableSessionLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableSessionAddLineDto }) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.addLine(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...TABLE_SESSIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useAllocateTableSessionSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableSessionAllocateSeatDto }) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.allocateSeat(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...TABLE_SESSIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useRemoveTableSessionSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, allocationId }: { id: string; allocationId: string }) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.removeSeat(id, allocationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...TABLE_SESSIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useCheckoutTableSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableSessionCheckoutDto }) => {
      const service = container.resolve<ITableSessionService>("tableSessionService");
      return service.checkout(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TABLE_SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TABLE_SESSIONS_QUERY_KEY, variables.id],
      });
    },
  });
}
