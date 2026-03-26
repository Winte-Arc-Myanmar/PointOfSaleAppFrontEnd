/**
 * Product repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Product } from "../entities/Product";
import type { ProductDto } from "@/core/application/dtos/ProductDto";

export interface GetProductsParams {
  page?: number;
  limit?: number;
}

export interface IProductRepository {
  getAll(params?: GetProductsParams): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(data: Omit<ProductDto, "id">): Promise<Product>;
  update(id: string, data: Omit<ProductDto, "id">): Promise<Product>;
  delete(id: string): Promise<void>;
}
