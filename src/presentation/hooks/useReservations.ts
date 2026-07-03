"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  ReservationCreateDto,
  ReservationSeatDto,
  ReservationUpdateDto,
} from "@/core/application/dtos/ReservationDto";
import type { IReservationService } from "@/core/domain/services/IReservationService";
import type { GetReservationsParams } from "@/core/domain/repositories/IReservationRepository";

const RESERVATIONS_QUERY_KEY = ["reservations"];

export function useReservations(params?: GetReservationsParams) {
  return useQuery({
    queryKey: [
      ...RESERVATIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.locationId,
      params?.customerId,
      params?.status,
      params?.fromDate,
      params?.toDate,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IReservationService>("reservationService");
      return service.getAll(params);
    },
  });
}

export function useReservation(id: string | null) {
  return useQuery({
    queryKey: [...RESERVATIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IReservationService>("reservationService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationCreateDto) => {
      const service = container.resolve<IReservationService>("reservationService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReservationUpdateDto }) => {
      const service = container.resolve<IReservationService>("reservationService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...RESERVATIONS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IReservationService>("reservationService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
  });
}

function useReservationActionMutation(
  mutationFn: (id: string) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...RESERVATIONS_QUERY_KEY, id] });
    },
  });
}

export function useConfirmReservation() {
  return useReservationActionMutation((id) => {
    const service = container.resolve<IReservationService>("reservationService");
    return service.confirm(id);
  });
}

export function useCancelReservation() {
  return useReservationActionMutation((id) => {
    const service = container.resolve<IReservationService>("reservationService");
    return service.cancel(id);
  });
}

export function useNoShowReservation() {
  return useReservationActionMutation((id) => {
    const service = container.resolve<IReservationService>("reservationService");
    return service.noShow(id);
  });
}

export function useSeatReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReservationSeatDto }) => {
      const service = container.resolve<IReservationService>("reservationService");
      return service.seat(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...RESERVATIONS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
    },
  });
}
