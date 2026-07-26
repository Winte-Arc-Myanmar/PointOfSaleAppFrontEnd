"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITransferOrderService } from "@/core/domain/services/ITransferOrderService";
import type {
  GetTransferOrdersParams,
  TransferOrderWriteDto,
} from "@/core/domain/repositories/ITransferOrderRepository";

const TRANSFER_ORDERS_QUERY_KEY = ["transfer-orders"];

export function useTransferOrders(params?: GetTransferOrdersParams) {
  return useQuery({
    queryKey: [
      ...TRANSFER_ORDERS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service =
        container.resolve<ITransferOrderService>("transferOrderService");
      return service.getAll(params);
    },
  });
}

export function useTransferOrder(id: string | null) {
  return useQuery({
    queryKey: [...TRANSFER_ORDERS_QUERY_KEY, id],
    queryFn: () => {
      const service =
        container.resolve<ITransferOrderService>("transferOrderService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateTransferOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferOrderWriteDto) => {
      const service =
        container.resolve<ITransferOrderService>("transferOrderService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_ORDERS_QUERY_KEY });
    },
  });
}

export function useUpdateTransferOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferOrderWriteDto }) => {
      const service =
        container.resolve<ITransferOrderService>("transferOrderService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TRANSFER_ORDERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteTransferOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service =
        container.resolve<ITransferOrderService>("transferOrderService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_ORDERS_QUERY_KEY });
    },
  });
}
