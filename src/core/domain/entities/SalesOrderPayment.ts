import type { Id } from "@/core/domain/types";

export interface SalesOrderPayment {
  id: Id;
  tenantId: string;
  salesOrderId: string;
  paymentMethodId: string;
  posSessionId: string;
  amount: number;
  transactionReference: string;
  paymentDate?: string | null;
  updatedAt?: string | null;
}

