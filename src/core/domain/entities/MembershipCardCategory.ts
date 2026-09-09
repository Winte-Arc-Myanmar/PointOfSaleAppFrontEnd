/**
 * Membership card category (CRUD from /v1/membership-card-categories).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface MembershipCardCategory {
  id: Id;
  name: string;
  tenantId: string;
  parentId: string | null;
  description: string;
  sortOrder: number;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  children?: MembershipCardCategory[];
}
