/**
 * DTOs for sales order line API request/response.
 * Application layer - matches backend contract.
 */

export interface SalesOrderLineDto {
  id?: string;
  salesOrderId?: string;
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

