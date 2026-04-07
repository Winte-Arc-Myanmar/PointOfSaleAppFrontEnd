/**
 * DTOs for sales order payment API request/response.
 * Application layer - matches backend contract.
 */

export interface SalesOrderPaymentDto {
  id?: string;
  tenantId: string;
  salesOrderId?: string;
  paymentMethodId: string;
  posSessionId: string;
  amount: number;
  transactionReference: string;
  paymentDate?: string | null;
  updatedAt?: string | null;
}

