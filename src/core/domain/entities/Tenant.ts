/**
 * Tenant entity.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

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
}
