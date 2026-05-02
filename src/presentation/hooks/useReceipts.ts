"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IReceiptService } from "@/core/domain/services/IReceiptService";

const RECEIPTS_QUERY_KEY = ["receipts"];

export function useReceipt(salesOrderId: string | null) {
  return useQuery({
    queryKey: [...RECEIPTS_QUERY_KEY, salesOrderId],
    queryFn: () => {
      const service = container.resolve<IReceiptService>("receiptService");
      return service.getBySalesOrderId(salesOrderId!);
    },
    enabled: !!salesOrderId,
  });
}

