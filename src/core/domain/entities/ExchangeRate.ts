import type { Id } from "@/core/domain/types";

export interface ExchangeRate {
  id: Id;
  tenantId: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: string;
  effectiveFrom: string;
  effectiveTo: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
