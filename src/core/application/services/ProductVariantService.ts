/**
 * Product variant service implementation.
 * Application layer - delegates to IProductVariantRepository.
 */

import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";
import type { IProductVariantRepository } from "@/core/domain/repositories/IProductVariantRepository";
import type { GetProductVariantsParams } from "@/core/domain/repositories/IProductVariantRepository";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import type { ProductVariantDto } from "../dtos/ProductVariantDto";

export class ProductVariantService implements IProductVariantService {
  constructor(
    private readonly productVariantRepository: IProductVariantRepository
  ) {}

  async getAll(
    productId: string,
    params?: GetProductVariantsParams
  ): Promise<ProductVariant[]> {
    return this.productVariantRepository.getAll(productId, params);
  }

  async getById(
    productId: string,
    id: string
  ): Promise<ProductVariant | null> {
    return this.productVariantRepository.getById(productId, id);
  }

  async create(
    productId: string,
    data: Omit<ProductVariantDto, "id">
  ): Promise<ProductVariant> {
    return this.productVariantRepository.create(productId, data);
  }

  async update(
    productId: string,
    id: string,
    data: Omit<ProductVariantDto, "id">
  ): Promise<ProductVariant> {
    return this.productVariantRepository.update(productId, id, data);
  }

  async delete(productId: string, id: string): Promise<void> {
    return this.productVariantRepository.delete(productId, id);
  }
}
