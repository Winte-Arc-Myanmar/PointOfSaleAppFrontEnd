import type { Refund } from "@/core/domain/entities/Refund";
import type { RefundDto, RefundLineDto } from "@/core/application/dtos/RefundDto";

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

function mapLine(dto: RefundLineDto | undefined) {
  return {
    id: dto?.id,
    salesOrderLineId: String(dto?.salesOrderLineId ?? ""),
    variantId: dto?.variantId,
    returnedQuantity: parseDecimal(dto?.returnedQuantity),
    unitPrice: parseDecimal(dto?.unitPrice),
    lineDiscount: parseDecimal(dto?.lineDiscount),
    taxAmount: parseDecimal(dto?.taxAmount),
    lineRefund: parseDecimal(dto?.lineRefund),
  };
}

export function toRefund(dto: RefundDto): Refund {
  return {
    returnId: dto.returnId,
    returnNumber: dto.returnNumber ?? "",
    salesOrderId: dto.salesOrderId,
    reason: dto.reason ?? "",
    refundMethod: dto.refundMethod ?? "CASH",
    subtotalRefund: parseDecimal(dto.subtotalRefund),
    taxRefund: parseDecimal(dto.taxRefund),
    totalRefund: parseDecimal(dto.totalRefund),
    orderStatus: dto.orderStatus ?? "",
    lines: Array.isArray(dto.lines) ? dto.lines.map((l) => mapLine(l)) : [],
    createdAt: dto.createdAt ?? null,
  };
}

