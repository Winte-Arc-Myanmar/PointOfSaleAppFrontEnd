/**
 * Product entity <-> DTO mappers.
 * Application layer.
 */

import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "../dtos/ProductDto";

/** API may return basePrice as Decimal.js-style { s, e, d }; convert to number. */
function parseDecimalPrice(val: unknown): number {
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

type ProductDtoRaw = Omit<ProductDto, "basePrice"> & {
  id: string;
  basePrice?: unknown;
  taxRate?: {
    id?: string;
    name?: string;
    ratePercentage?: unknown;
    isPriceInclusive?: boolean;
  };
  category?: {
    name?: string;
    description?: string;
    parentId?: string | null;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  baseUom?: {
    name?: string;
    abbreviation?: string;
    classId?: string;
    conversionRateToBase?: unknown;
  };
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function toProduct(dto: ProductDtoRaw): Product {
  return {
    id: dto.id,
    name: dto.name,
    tenantId: dto.tenantId,
    baseSku: dto.baseSku,
    basePrice: parseDecimalPrice(dto.basePrice),
    baseUomId: dto.baseUomId,
    categoryId: dto.categoryId,
    categoryName: dto.category?.name,
    categoryDescription: dto.category?.description,
    baseUomName:
      dto.baseUom?.abbreviation?.trim() || dto.baseUom?.name || undefined,
    categoryParentId: dto.category?.parentId ?? undefined,
    categorySortOrder: dto.category?.sortOrder,
    categoryCreatedAt: dto.category?.createdAt,
    categoryUpdatedAt: dto.category?.updatedAt,
    baseUomClassId: dto.baseUom?.classId,
    baseUomConversionRateToBase:
      dto.baseUom?.conversionRateToBase != null
        ? parseDecimalPrice(dto.baseUom.conversionRateToBase)
        : undefined,
    globalAttributes: dto.globalAttributes,
    trackingType: dto.trackingType,
    imageUrl: dto.imageUrl ?? undefined,
    isTaxable: dto.isTaxable,
    taxRateId: dto.taxRateId ?? dto.taxRate?.id ?? undefined,
    taxRateName: dto.taxRate?.name,
    taxRateRatePercentage:
      dto.taxRate?.ratePercentage != null
        ? parseDecimalPrice(dto.taxRate.ratePercentage)
        : undefined,
    taxRateIsPriceInclusive:
      dto.taxRate?.isPriceInclusive != null
        ? Boolean(dto.taxRate.isPriceInclusive)
        : undefined,
    deletedAt: dto.deletedAt ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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
    imageUrl: product.imageUrl,
    isTaxable: product.isTaxable,
    taxRateId: product.taxRateId,
  };
}
