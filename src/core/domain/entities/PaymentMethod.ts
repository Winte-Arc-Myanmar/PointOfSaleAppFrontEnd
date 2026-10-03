import type { Id } from "@/core/domain/types";

export const PAYMENT_METHOD_KINDS = [
  "CASH",
  "CARD",
  "MOBILE_WALLET",
  "BANK_TRANSFER",
  "CUSTOMER_CREDIT",
  "GUEST_CARD",
  "VOUCHER",
  "OTHER",
] as const;
export type PaymentMethodKind = (typeof PAYMENT_METHOD_KINDS)[number];

export interface PaymentMethod {
  id: Id;
  tenantId: string;
  name: string;
  kind: PaymentMethodKind;
  isActive: boolean;
  glAccountId: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

