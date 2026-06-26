/**
 * Product variant service interface.
 * Domain layer - defines the contract for variant operations.
 */

import type { ProductVariant } from "../entities/ProductVariant";
import type { ProductVariantDto } from "@/core/application/dtos/ProductVariantDto";
import type { GetProductVariantsParams } from "../repositories/IProductVariantRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IProductVariantService {
  getAll(
    productId: string,
    params?: GetProductVariantsParams
  ): Promise<PaginatedResult<ProductVariant>>;
  getById(productId: string, id: string): Promise<ProductVariant | null>;
  create(
    productId: string,
    data: Omit<ProductVariantDto, "id">
  ): Promise<ProductVariant>;
  update(
    productId: string,
    id: string,
    data: Omit<ProductVariantDto, "id">
  ): Promise<ProductVariant>;
  delete(productId: string, id: string): Promise<void>;
}
