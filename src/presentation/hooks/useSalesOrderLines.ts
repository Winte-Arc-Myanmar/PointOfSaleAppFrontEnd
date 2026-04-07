"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ISalesOrderLineService } from "@/core/domain/services/ISalesOrderLineService";
import type { SalesOrderLineDto } from "@/core/application/dtos/SalesOrderLineDto";
import type { GetSalesOrderLinesParams } from "@/core/domain/repositories/ISalesOrderLineRepository";

const SALES_ORDER_LINES_QUERY_KEY = ["sales-order-lines"];

export function useSalesOrderLines(
  salesOrderId: string | null,
  params?: GetSalesOrderLinesParams
) {
  return useQuery({
    queryKey: [
      ...SALES_ORDER_LINES_QUERY_KEY,
      salesOrderId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ISalesOrderLineService>(
        "salesOrderLineService"
      );
      return service.getAll(salesOrderId!, params);
    },
    enabled: !!salesOrderId,
  });
}

export function useCreateSalesOrderLine(salesOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
    ) => {
      const service = container.resolve<ISalesOrderLineService>(
        "salesOrderLineService"
      );
      return service.create(salesOrderId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_LINES_QUERY_KEY });
    },
  });
}

export function useDeleteSalesOrderLine(salesOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ISalesOrderLineService>(
        "salesOrderLineService"
      );
      return service.delete(salesOrderId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_LINES_QUERY_KEY });
    },
  });
}

