import type { Id } from "@/core/domain/types";
import type { RefundMethod } from "@/core/application/dtos/RefundDto";

export interface RefundLine {
  id?: Id;
  salesOrderLineId: Id;
  variantId?: Id;
  /** The item's name, when the API includes it on the refund line itself. */
  productName?: string | null;
  /** The variant's name, when the API includes it on the refund line itself. */
  variantName?: string | null;
  returnedQuantity: number;
  unitPrice: number;
  lineDiscount: number;
  taxAmount: number;
  lineRefund: number;
}

export interface Refund {
  returnId: Id;
  returnNumber: string;
  salesOrderId: Id;
  reason: string;
  refundMethod: RefundMethod;
  subtotalRefund: number;
  taxRefund: number;
  totalRefund: number;
  orderStatus: string;
  lines: RefundLine[];
  createdAt?: string | null;
}

