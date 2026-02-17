/**
 * Product service implementation.
 * Application layer - business logic and orchestration.
 */

import type { IProductService } from "@/core/domain/services/IProductService";
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "../dtos/ProductDto";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getAll(): Promise<Product[]> {
    return this.productRepository.getAll();
  }

  async create(
    data: Omit<ProductDto, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    return this.productRepository.create(data);
  }
}
