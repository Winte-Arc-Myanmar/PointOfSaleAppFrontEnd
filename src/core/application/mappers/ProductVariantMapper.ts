/**
 * Product variant entity <-> DTO mappers.
 * Application layer.
 */

import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import type { ProductVariantDto } from "../dtos/ProductVariantDto";

export function toProductVariant(
  productId: string,
  dto: ProductVariantDto & { id: string }
): ProductVariant {
  return {
    id: dto.id,
    productId,
    variantSku: dto.variantSku,
    matrixOptions: dto.matrixOptions ?? {},
    barcode: dto.barcode,
    priceModifier: dto.priceModifier ?? 0,
  };
}

export function toProductVariantDto(
  variant: Partial<ProductVariant>
): ProductVariantDto {
  return {
    ...(variant.id && { id: variant.id }),
    variantSku: variant.variantSku ?? "",
    matrixOptions: variant.matrixOptions ?? {},
    barcode: variant.barcode,
    priceModifier: variant.priceModifier ?? 0,
  };
}
