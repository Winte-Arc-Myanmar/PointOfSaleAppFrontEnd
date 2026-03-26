/**
 * Product variant entity <-> DTO mappers.
 * Application layer.
 */

import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import type { ProductVariantDto } from "../dtos/ProductVariantDto";

/** API may return priceModifier as Decimal.js-style { s, e, d }; convert to number. */
function parseDecimal(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (
    val != null &&
    typeof val === "object" &&
    "s" in val &&
    "e" in val &&
    "d" in val
  ) {
    const { s, e, d } = val as { s: number; e: number; d: number[] };
    if (!Array.isArray(d)) return 0;
    let n = 0;
    for (let i = 0; i < d.length; i++) {
      n += d[i] * Math.pow(10, e - i * 7);
    }
    return s * n;
  }
  return Number(val) || 0;
}

export function toProductVariant(
  productId: string,
  dto: (Omit<ProductVariantDto, "priceModifier"> & {
    id: string;
    priceModifier?: unknown;
  })
): ProductVariant {
  return {
    id: dto.id,
    productId,
    variantSku: dto.variantSku,
    matrixOptions: dto.matrixOptions ?? {},
    barcode: dto.barcode,
    priceModifier: parseDecimal(dto.priceModifier),
    deletedAt: dto.deletedAt ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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
