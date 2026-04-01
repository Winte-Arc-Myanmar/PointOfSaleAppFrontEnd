/**
 * DTOs for loyalty ledger API request/response.
 * Application layer - matches backend contract.
 */

export interface LoyaltyLedgerEntryDto {
  id?: string;
  tenantId: string;
  customerId?: string;
  transactionType: string;
  points: number;
  referenceOrderId?: string | null;
  expiryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
