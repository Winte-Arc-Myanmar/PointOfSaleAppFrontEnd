/**
 * DTOs for customer API request/response.
 * Application layer - matches backend contract.
 */

export interface CustomerDto {
  id?: string;
  tenantId: string;
  accountType: string;
  name: string;
  phone: string;
  email: string;
  hasCreditAccount: boolean;
  maxCreditLimit: string;
  currentCreditBalance?: string;
  paymentTermsDays: number;
  loyaltyTier: string;
  lifetimePointsEarned?: number;
  createdAt?: string;
  updatedAt?: string;
}

