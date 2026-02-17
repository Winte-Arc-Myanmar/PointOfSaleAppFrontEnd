/**
 * Product entity.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";
import type { Money } from "@/core/domain/value-objects/Money";

export interface Product {
  id: Id;
  name: string;
  sku: string;
  price: Money;
  quantityInStock: number;
  createdAt: Date;
  updatedAt: Date;
}
