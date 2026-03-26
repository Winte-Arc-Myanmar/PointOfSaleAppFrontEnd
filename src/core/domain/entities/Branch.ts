/**
 * Branch entity
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface Branch {
  id: Id;
  name: string;
  tenantId: string;
  branchCode: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: Record<string, string> | null;
  status?: string | null;
  managerId?: string | null;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
