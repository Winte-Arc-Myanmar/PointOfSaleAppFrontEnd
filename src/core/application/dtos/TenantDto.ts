/**
 * DTOs for tenant API request/response.
 * Application layer - matches backend contract.
 */

import type { TenantCurrency } from "@/core/domain/entities/Tenant";

export interface TenantDto {
  id?: string;
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
  baseCurrency?: TenantCurrency;
  status?: string;
  deletedAt?: string | null;
  createdAt?: string;
}
