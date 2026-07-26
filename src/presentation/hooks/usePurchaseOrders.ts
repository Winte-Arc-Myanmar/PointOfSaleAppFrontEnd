"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPurchaseOrderService } from "@/core/domain/services/IPurchaseOrderService";
import type {
  GetPurchaseOrdersParams,
  PurchaseOrderWriteDto,
} from "@/core/domain/repositories/IPurchaseOrderRepository";

const PURCHASE_ORDERS_QUERY_KEY = ["purchase-orders"];

export function usePurchaseOrders(params?: GetPurchaseOrdersParams) {
  return useQuery({
    queryKey: [
      ...PURCHASE_ORDERS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service =
        container.resolve<IPurchaseOrderService>("purchaseOrderService");
      return service.getAll(params);
    },
  });
}

export function usePurchaseOrder(id: string | null) {
  return useQuery({
    queryKey: [...PURCHASE_ORDERS_QUERY_KEY, id],
    queryFn: () => {
      const service =
        container.resolve<IPurchaseOrderService>("purchaseOrderService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseOrderWriteDto) => {
      const service =
        container.resolve<IPurchaseOrderService>("purchaseOrderService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_QUERY_KEY });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderWriteDto }) => {
      const service =
        container.resolve<IPurchaseOrderService>("purchaseOrderService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PURCHASE_ORDERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service =
        container.resolve<IPurchaseOrderService>("purchaseOrderService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDERS_QUERY_KEY });
    },
  });
}
