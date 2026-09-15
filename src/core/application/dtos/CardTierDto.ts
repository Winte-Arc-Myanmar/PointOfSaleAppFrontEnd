/**
 * Card tier DTOs.
 * Application layer - matches /v1/card-tiers contract.
 */

export interface CardTierDto {
  id?: string;
  tenantId?: string;
  name: string;
  rank: number;
  preloadAmount: number | string;
  preloadFunding: string;
  discountBps: number;
  isPostpaid: boolean;
  validityDays: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** POST / PATCH body — tenant comes from auth, not the payload. */
export interface CardTierWriteDto {
  name: string;
  rank: number;
  preloadAmount: string;
  preloadFunding: string;
  discountBps: number;
  isPostpaid: boolean;
  validityDays: number;
  isActive: boolean;
}
