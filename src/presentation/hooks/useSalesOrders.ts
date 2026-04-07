"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ISalesOrderService } from "@/core/domain/services/ISalesOrderService";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";
import type { GetSalesOrdersParams } from "@/core/domain/repositories/ISalesOrderRepository";

const SALES_ORDERS_QUERY_KEY = ["sales-orders"];

export function useSalesOrders(params?: GetSalesOrdersParams) {
  return useQuery({
    queryKey: [
      ...SALES_ORDERS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
      params?.status,
      params?.customerId,
      params?.dateFrom,
      params?.dateTo,
    ],
    queryFn: () => {
      const service = container.resolve<ISalesOrderService>("salesOrderService");
      return service.getAll(params);
    },
  });
}

export function useSalesOrder(id: string | null) {
  return useQuery({
    queryKey: [...SALES_ORDERS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ISalesOrderService>("salesOrderService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">) => {
      const service = container.resolve<ISalesOrderService>("salesOrderService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDERS_QUERY_KEY });
    },
  });
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">;
    }) => {
      const service = container.resolve<ISalesOrderService>("salesOrderService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...SALES_ORDERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ISalesOrderService>("salesOrderService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDERS_QUERY_KEY });
    },
  });
}

