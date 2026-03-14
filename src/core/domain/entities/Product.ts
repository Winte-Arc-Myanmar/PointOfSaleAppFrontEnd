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
  globalAttributes?: Record<string, unknown>;
  trackingType: string;
}
