/**
 * Product service interface.
 * Domain layer - defines the contract for product operations.
 */

import type { Product } from "../entities/Product";
import type { ProductDto } from "@/core/application/dtos/ProductDto";
import type { GetProductsParams } from "../repositories/IProductRepository";

export interface IProductService {
  getAll(params?: GetProductsParams): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(data: Omit<ProductDto, "id">): Promise<Product>;
  update(id: string, data: Omit<ProductDto, "id">): Promise<Product>;
  delete(id: string): Promise<void>;
}
