import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import type { SalesOrderDto } from "../dtos/SalesOrderDto";

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

export function toSalesOrder(
  dto: Omit<SalesOrderDto, "subtotal" | "totalDiscount" | "totalTax" | "grandTotal"> & {
    id: string;
    subtotal?: unknown;
    totalDiscount?: unknown;
    totalTax?: unknown;
    grandTotal?: unknown;
  }
): SalesOrder {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    customerId: dto.customerId ?? "",
    locationId: dto.locationId ?? "",
    orderNumber: dto.orderNumber ?? "",
    salesChannel: dto.salesChannel ?? "",
    idempotencyKey: dto.idempotencyKey ?? null,
    subtotal: parseDecimal(dto.subtotal),
    totalDiscount: parseDecimal(dto.totalDiscount),
    totalTax: parseDecimal(dto.totalTax),
    grandTotal: parseDecimal(dto.grandTotal),
    status: dto.status ?? "DRAFT",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toSalesOrderDto(order: Partial<SalesOrder>): SalesOrderDto {
  return {
    ...(order.id && { id: order.id }),
    tenantId: order.tenantId ?? "",
    customerId: order.customerId ?? "",
    locationId: order.locationId ?? "",
    orderNumber: order.orderNumber ?? "",
    salesChannel: order.salesChannel ?? "POS",
    idempotencyKey: order.idempotencyKey ?? null,
    subtotal: order.subtotal ?? 0,
    totalDiscount: order.totalDiscount ?? 0,
    totalTax: order.totalTax ?? 0,
    grandTotal: order.grandTotal ?? 0,
    status: order.status ?? "DRAFT",
  };
}

