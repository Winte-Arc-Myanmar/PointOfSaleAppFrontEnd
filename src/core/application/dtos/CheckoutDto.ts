/**
 * DTOs for checkout API request/response.
 * Application layer - matches backend contract (decimals may arrive as strings).
 */

export type CheckoutSalesChannel = "POS" | "ONLINE" | "PHONE" | "OTHER" | string;

export interface CheckoutItemDto {
  variantId: string;
  quantity: number;
  lineDiscount?: number;
}

export interface CheckoutPaymentDto {
  paymentMethodId: string;
  amount: number;
  transactionReference?: string | null;
}

export interface CheckoutRequestDto {
  locationId: string;
  salesChannel: CheckoutSalesChannel;
  customerId?: string | null;
  posSessionId: string;
  idempotencyKey: string;
  items: CheckoutItemDto[];
  payments: CheckoutPaymentDto[];
  tenantId: string;
}

export interface CheckoutLineResultDto {
  id?: string;
  variantId?: string;
  quantity?: unknown;
  unitPrice?: unknown;
  lineDiscount?: unknown;
  taxAmount?: unknown;
  lineTotal?: unknown;
}

export interface CheckoutPaymentResultDto {
  id?: string;
  paymentMethodId?: string;
  amount?: unknown;
  transactionReference?: string | null;
  paymentDate?: string | null;
}

export interface CheckoutResultDto {
  orderId: string;
  orderNumber: string;
  grandTotal?: unknown;
  totalPaid?: unknown;
  change?: unknown;
  status?: string;
  lines?: CheckoutLineResultDto[];
  payments?: CheckoutPaymentResultDto[];
}

