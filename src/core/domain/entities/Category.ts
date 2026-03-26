/**
 * Category entity (CRUD from /v1/categories).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface Category {
  id: Id;
  name: string;
  tenantId: string;
  parentId: string | null;
  description: string;
  sortOrder: number;
  /** Present when API returns full payload (e.g. getById, tree). */
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  children?: Category[];
}
