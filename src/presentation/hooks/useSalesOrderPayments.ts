"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ISalesOrderPaymentService } from "@/core/domain/services/ISalesOrderPaymentService";
import type { SalesOrderPaymentDto } from "@/core/application/dtos/SalesOrderPaymentDto";
import type { GetSalesOrderPaymentsParams } from "@/core/domain/repositories/ISalesOrderPaymentRepository";

const SALES_ORDER_PAYMENTS_QUERY_KEY = ["sales-order-payments"];

export function useSalesOrderPayments(
  salesOrderId: string | null,
  params?: GetSalesOrderPaymentsParams
) {
  return useQuery({
    queryKey: [
      ...SALES_ORDER_PAYMENTS_QUERY_KEY,
      salesOrderId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ISalesOrderPaymentService>(
        "salesOrderPaymentService"
      );
      return service.getAll(salesOrderId!, params);
    },
    enabled: !!salesOrderId,
  });
}

export function useCreateSalesOrderPayment(salesOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
    ) => {
      const service = container.resolve<ISalesOrderPaymentService>(
        "salesOrderPaymentService"
      );
      return service.create(salesOrderId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_PAYMENTS_QUERY_KEY });
    },
  });
}

export function useDeleteSalesOrderPayment(salesOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ISalesOrderPaymentService>(
        "salesOrderPaymentService"
      );
      return service.delete(salesOrderId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_PAYMENTS_QUERY_KEY });
    },
  });
}

