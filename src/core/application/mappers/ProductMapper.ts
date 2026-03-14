/**
 * Product entity <-> DTO mappers.
 * Application layer.
 */

import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "../dtos/ProductDto";

export function toProduct(dto: ProductDto & { id: string }): Product {
  return {
    id: dto.id,
    name: dto.name,
    tenantId: dto.tenantId,
    baseSku: dto.baseSku,
    basePrice: dto.basePrice,
    baseUomId: dto.baseUomId,
    categoryId: dto.categoryId,
    globalAttributes: dto.globalAttributes,
    trackingType: dto.trackingType,
  };
}

export function toProductDto(product: Partial<Product>): ProductDto {
  return {
    ...(product.id && { id: product.id }),
    name: product.name ?? "",
    tenantId: product.tenantId ?? "",
    baseSku: product.baseSku ?? "",
    basePrice: product.basePrice ?? 0,
    baseUomId: product.baseUomId ?? "",
    categoryId: product.categoryId ?? "",
    globalAttributes: product.globalAttributes,
    trackingType: product.trackingType ?? "STANDARD",
  };
}
