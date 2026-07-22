/**
 * Tenant entity.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type TenantCurrency = "MMK" | "USD";

export interface Tenant {
  id: Id;
  name: string;
  legalName: string;
  domain: string;
  website: string;
  logoUrl: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  baseCurrency: TenantCurrency;
  status?: string;
  deletedAt?: string | null;
  createdAt?: string;
}
