/**
 * DTOs for sales order API request/response.
 * Application layer - matches backend contract (decimals are strings on the wire).
 */

export interface SalesOrderDto {
  id?: string;
  tenantId: string;
  customerId: string;
  locationId: string;
  orderNumber: string;
  salesChannel: string;
  idempotencyKey?: string | null;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

