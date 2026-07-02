"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IKdsTicketService } from "@/core/domain/services/IKdsTicketService";
import type { KdsFireDto } from "@/core/application/dtos/KdsTicketDto";
import type { GetKdsTicketsParams } from "@/core/domain/repositories/IKdsTicketRepository";

const KDS_TICKETS_QUERY_KEY = ["kds-tickets"];

export function useKdsTickets(params?: GetKdsTicketsParams) {
  return useQuery({
    queryKey: [
      ...KDS_TICKETS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.stationId,
      params?.sessionId,
      params?.status,
      params?.activeOnly,
    ],
    queryFn: () => {
      const service = container.resolve<IKdsTicketService>("kdsTicketService");
      return service.getAll(params);
    },
  });
}

export function useKdsTicket(id: string | null) {
  return useQuery({
    queryKey: [...KDS_TICKETS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IKdsTicketService>("kdsTicketService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useFireKdsPendingLines() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KdsFireDto) => {
      const service = container.resolve<IKdsTicketService>("kdsTicketService");
      return service.firePendingLines(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KDS_TICKETS_QUERY_KEY });
    },
  });
}

function useKdsTicketMutation(
  mutationFn: (id: string) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KDS_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...KDS_TICKETS_QUERY_KEY, id] });
    },
  });
}

export function useStartKdsTicket() {
  return useKdsTicketMutation((id) => {
    const service = container.resolve<IKdsTicketService>("kdsTicketService");
    return service.start(id);
  });
}

export function useReadyKdsTicket() {
  return useKdsTicketMutation((id) => {
    const service = container.resolve<IKdsTicketService>("kdsTicketService");
    return service.ready(id);
  });
}

export function useRecallKdsTicket() {
  return useKdsTicketMutation((id) => {
    const service = container.resolve<IKdsTicketService>("kdsTicketService");
    return service.recall(id);
  });
}

export function useExpediteKdsTicket() {
  return useKdsTicketMutation((id) => {
    const service = container.resolve<IKdsTicketService>("kdsTicketService");
    return service.expedite(id);
  });
}

export function useReadyKdsTicketLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, lineId }: { ticketId: string; lineId: string }) => {
      const service = container.resolve<IKdsTicketService>("kdsTicketService");
      return service.readyLine(lineId).then((line) => ({ line, ticketId }));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KDS_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...KDS_TICKETS_QUERY_KEY, variables.ticketId],
      });
    },
  });
}
