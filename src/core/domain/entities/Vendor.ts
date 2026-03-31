/**
 * Vendor entity (CRUD from /v1/vendors).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface Vendor {
  id: Id;
  tenantId: string;
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

