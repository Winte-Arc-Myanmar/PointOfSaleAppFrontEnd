/**
 * DTOs for product API request/response.
 * Application layer - matches backend contract.
 */

import type { ProductTerms } from "@/core/domain/entities/Product";

export interface ProductDto extends Partial<ProductTerms> {
  id?: string;
  name: string;
  tenantId: string;
  baseSku: string;
  /** App layer uses number; ApiProductRepository sends API decimal string on create/update. */
  basePrice: number;
  baseUomId: string;
  categoryId: string;
  globalAttributes?: Record<string, unknown>;
  trackingType: string;
  imageUrl?: string | null;
  isTaxable?: boolean;
  isAvailable?: boolean;
  taxRateId?: string | null;
}
