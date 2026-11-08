/**
 * DTOs for refunds API request/response.
 * Application layer - matches backend contract (decimals may arrive as strings).
 */

export type RefundMethod = "CASH" | "ORIGINAL_PAYMENT" | "STORE_CREDIT" | string;

export interface RefundItemRequestDto {
  salesOrderLineId: string;
  returnedQuantity: number;
}

export interface RefundRequestDto {
  salesOrderId: string;
  reason: string;
  refundMethod: RefundMethod;
  posSessionId: string;
  items: RefundItemRequestDto[];
}

export interface RefundLineDto {
  id?: string;
  salesOrderLineId?: string;
  variantId?: string;
  /** The item's name, when the API includes it on the refund line itself. */
  productName?: string | null;
  /** The variant's name, when the API includes it on the refund line itself. */
  variantName?: string | null;
  returnedQuantity?: unknown;
  unitPrice?: unknown;
  lineDiscount?: unknown;
  taxAmount?: unknown;
  lineRefund?: unknown;
}

export interface RefundDto {
  returnId: string;
  returnNumber?: string;
  salesOrderId: string;
  reason?: string;
  refundMethod?: RefundMethod;
  subtotalRefund?: unknown;
  taxRefund?: unknown;
  totalRefund?: unknown;
  orderStatus?: string;
  lines?: RefundLineDto[];
  createdAt?: string | null;
}

