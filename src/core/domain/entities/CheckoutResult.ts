import type { Id } from "@/core/domain/types";

export interface CheckoutLineResult {
  id?: Id;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  lineDiscount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface CheckoutPaymentResult {
  id?: Id;
  paymentMethodId?: string;
  amount: number;
  transactionReference?: string | null;
  paymentDate?: string | null;
}

export interface CheckoutResult {
  orderId: Id;
  orderNumber: string;
  grandTotal: number;
  totalPaid: number;
  change: number;
  status: string;
  lines: CheckoutLineResult[];
  payments: CheckoutPaymentResult[];
}

