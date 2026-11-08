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
  /** Read-only: the item's name as it was sold, filled in by the server. */
  productName?: string | null;
  /** Read-only: the variant's name (for example "Large"), filled in by the server. */
  variantName?: string | null;
  /** Read-only: the category's name, filled in by the server. */
  categoryName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

