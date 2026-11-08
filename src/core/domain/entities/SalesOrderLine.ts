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
  /** The item's name as it was sold, so screens can show it instead of the variant id. */
  productName?: string | null;
  /** The variant's name (for example "Large"). */
  variantName?: string | null;
  /** The category's name. */
  categoryName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

