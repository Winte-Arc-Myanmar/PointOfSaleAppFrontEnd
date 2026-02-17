/**
 * Product repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Product } from "../entities/Product";
import type { ProductDto } from "@/core/application/dtos/ProductDto";

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  create(data: Omit<ProductDto, "id" | "createdAt" | "updatedAt">): Promise<Product>;
}
