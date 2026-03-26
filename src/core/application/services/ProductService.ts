/**
 * Product service implementation.
 * Application layer - delegates to IProductRepository.
 */

import type { IProductService } from "@/core/domain/services/IProductService";
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { GetProductsParams } from "@/core/domain/repositories/IProductRepository";
import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "../dtos/ProductDto";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getAll(params?: GetProductsParams): Promise<Product[]> {
    return this.productRepository.getAll(params);
  }

  async getById(id: string): Promise<Product | null> {
    return this.productRepository.getById(id);
  }

  async create(data: Omit<ProductDto, "id">): Promise<Product> {
    return this.productRepository.create(data);
  }

  async update(id: string, data: Omit<ProductDto, "id">): Promise<Product> {
    return this.productRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.productRepository.delete(id);
  }
}
