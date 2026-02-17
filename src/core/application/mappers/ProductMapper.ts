/**
 * Product entity <-> DTO mappers.
 * Application layer.
 */

import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "../dtos/ProductDto";

export function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    sku: dto.sku,
    price: { amount: dto.priceAmount, currency: dto.priceCurrency },
    quantityInStock: dto.quantityInStock,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function toProductDto(product: Product): ProductDto {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    priceAmount: product.price.amount,
    priceCurrency: product.price.currency,
    quantityInStock: product.quantityInStock,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
