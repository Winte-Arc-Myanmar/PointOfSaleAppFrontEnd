/**
 * Loyalty ledger entry (nested under /v1/customers/:customerId/loyalty-ledger).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type LoyaltyTransactionType = "EARN" | "REDEEM" | "ADJUST" | "EXPIRE" | string;

export interface LoyaltyLedgerEntry {
  id: Id;
  tenantId: string;
  customerId: string;
  transactionType: LoyaltyTransactionType;
  points: number;
  referenceOrderId: string | null;
  expiryDate: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
