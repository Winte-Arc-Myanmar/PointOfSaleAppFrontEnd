import type { Id } from "@/core/domain/types";

export interface TaxRate {
  id: Id;
  tenantId: string;
  name: string;
  ratePercentage: string;
  isPriceInclusive: boolean;
  glLiabilityAccountId: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
