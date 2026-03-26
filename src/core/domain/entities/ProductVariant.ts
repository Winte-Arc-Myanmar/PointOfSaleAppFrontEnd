/**
 * Product variant entity.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface ProductVariant {
  id: Id;
  productId: string;
  variantSku: string;
  matrixOptions: Record<string, string>;
  barcode?: string;
  priceModifier: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
