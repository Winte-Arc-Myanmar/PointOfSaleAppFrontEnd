"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRefundService } from "@/core/domain/services/IRefundService";
import type { RefundRequestDto } from "@/core/application/dtos/RefundDto";

const REFUNDS_QUERY_KEY = ["refunds"];

export function useRefund(id: string | null) {
  return useQuery({
    queryKey: [...REFUNDS_QUERY_KEY, "by-id", id],
    queryFn: () => {
      const service = container.resolve<IRefundService>("refundService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useRefundsByOrder(salesOrderId: string | null) {
  return useQuery({
    queryKey: [...REFUNDS_QUERY_KEY, "by-order", salesOrderId],
    queryFn: () => {
      const service = container.resolve<IRefundService>("refundService");
      return service.getBySalesOrderId(salesOrderId!);
    },
    enabled: !!salesOrderId,
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RefundRequestDto) => {
      const service = container.resolve<IRefundService>("refundService");
      return service.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REFUNDS_QUERY_KEY });
      if (variables?.salesOrderId) {
        queryClient.invalidateQueries({
          queryKey: [...REFUNDS_QUERY_KEY, "by-order", variables.salesOrderId],
        });
        queryClient.invalidateQueries({
          queryKey: ["sales-orders", variables.salesOrderId],
        });
      }
    },
  });
}

