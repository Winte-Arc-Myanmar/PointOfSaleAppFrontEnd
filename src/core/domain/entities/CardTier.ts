/**
 * Card tier — hotel-defined membership card product.
 * Editing a tier never affects cards already issued.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type CardTierPreloadFunding = "PURCHASED" | string;

export interface CardTier {
  id: Id;
  tenantId: string;
  name: string;
  rank: number;
  preloadAmount: number;
  preloadFunding: CardTierPreloadFunding;
  discountBps: number;
  isPostpaid: boolean;
  validityDays: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
