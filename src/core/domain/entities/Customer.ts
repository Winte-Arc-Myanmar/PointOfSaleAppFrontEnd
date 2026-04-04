/**
 * Customer entity (CRUD from /v1/customers).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type CustomerAccountType = "RETAIL" | "WHOLESALE" | "OTHER" | string;
export type CustomerLoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | string;

export interface Customer {
  id: Id;
  tenantId: string;
  accountType: CustomerAccountType;
  name: string;
  phone: string;
  email: string;
  hasCreditAccount: boolean;
  maxCreditLimit: string;
  currentCreditBalance: string;
  paymentTermsDays: number;
  loyaltyTier: CustomerLoyaltyTier;
  lifetimePointsEarned: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

