import type { Id } from "@/core/domain/types";

export interface SalesOrderLine {
  id: Id;
  salesOrderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineDiscount: number;
  taxRateId?: string | null;
  taxAmount: number;
  appliedPromotionId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

