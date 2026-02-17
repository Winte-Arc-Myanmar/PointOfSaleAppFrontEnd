/**
 * Product service interface.
 * Domain layer - defines the contract for product operations.
 */

import type { Product } from "../entities/Product";
import type { ProductDto } from "@/core/application/dtos/ProductDto";

export interface IProductService {
  getAll(): Promise<Product[]>;
  create(data: Omit<ProductDto, "id" | "createdAt" | "updatedAt">): Promise<Product>;
}
