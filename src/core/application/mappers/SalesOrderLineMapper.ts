import type { SalesOrderLine } from "@/core/domain/entities/SalesOrderLine";
import type { SalesOrderLineDto } from "../dtos/SalesOrderLineDto";

function parseDecimal(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
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
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return Number(val) || 0;
}

export function toSalesOrderLine(
  salesOrderId: string,
  dto: Omit<SalesOrderLineDto, "quantity" | "unitPrice" | "lineDiscount" | "taxAmount"> & {
    id: string;
    quantity?: unknown;
    unitPrice?: unknown;
    lineDiscount?: unknown;
    taxAmount?: unknown;
  }
): SalesOrderLine {
  return {
    id: dto.id,
    salesOrderId,
    variantId: dto.variantId ?? "",
    quantity: parseDecimal(dto.quantity),
    unitPrice: parseDecimal(dto.unitPrice),
    lineDiscount: parseDecimal(dto.lineDiscount),
    taxRateId: dto.taxRateId ?? null,
    taxAmount: parseDecimal(dto.taxAmount),
    appliedPromotionId: dto.appliedPromotionId ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toSalesOrderLineDto(line: Partial<SalesOrderLine>): SalesOrderLineDto {
  return {
    ...(line.id && { id: line.id }),
    variantId: line.variantId ?? "",
    quantity: line.quantity ?? 0,
    unitPrice: line.unitPrice ?? 0,
    lineDiscount: line.lineDiscount ?? 0,
    taxRateId: line.taxRateId ?? null,
    taxAmount: line.taxAmount ?? 0,
    appliedPromotionId: line.appliedPromotionId ?? null,
  };
}

