/**
 * Membership card template / card details (CRUD from /v1/membership-card-templates).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type MembershipCardTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | string;

export type MembershipCardBillingPeriod =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "LIFETIME"
  | "ONE_TIME"
  | string;

export interface MembershipCardTemplate {
  id: Id;
  tenantId: string;
  categoryId: string;
  /** Resolved when API embeds category.name */
  categoryName?: string;
  name: string;
  tier: MembershipCardTier;
  amount: number;
  billingPeriod: MembershipCardBillingPeriod;
  durationMonths: number | null;
  rules: string;
  benefits: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
