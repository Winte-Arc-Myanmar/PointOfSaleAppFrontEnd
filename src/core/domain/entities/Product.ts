/**
 * Product entity.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface Product {
  id: Id;
  name: string;
  tenantId: string;
  baseSku: string;
  basePrice: number;
  baseUomId: string;
  categoryId: string;
  /** Resolved from API category.name when present */
  categoryName?: string;
  /** Resolved from API category.description when present */
  categoryDescription?: string;
  /** Resolved from API baseUom.name or baseUom.abbreviation when present */
  baseUomName?: string;
  /** From API category when present */
  categoryParentId?: string | null;
  categorySortOrder?: number;
  categoryCreatedAt?: string;
  categoryUpdatedAt?: string;
  /** From API baseUom when present */
  baseUomClassId?: string;
  baseUomConversionRateToBase?: number;
  globalAttributes?: Record<string, unknown>;
  trackingType: string;
  imageUrl?: string | null;
  isTaxable?: boolean;
  taxRateId?: string | null;
  /** Resolved when API embeds `taxRate` on product */
  taxRateName?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
