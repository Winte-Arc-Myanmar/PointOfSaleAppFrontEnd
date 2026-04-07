import type { SalesOrderPayment } from "@/core/domain/entities/SalesOrderPayment";
import type { SalesOrderPaymentDto } from "../dtos/SalesOrderPaymentDto";

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

export function toSalesOrderPayment(
  salesOrderId: string,
  dto: Omit<SalesOrderPaymentDto, "amount"> & { id: string; amount?: unknown }
): SalesOrderPayment {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    salesOrderId,
    paymentMethodId: dto.paymentMethodId ?? "",
    posSessionId: dto.posSessionId ?? "",
    amount: parseDecimal(dto.amount),
    transactionReference: dto.transactionReference ?? "",
    paymentDate: dto.paymentDate ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toSalesOrderPaymentDto(
  payment: Partial<SalesOrderPayment>
): SalesOrderPaymentDto {
  return {
    ...(payment.id && { id: payment.id }),
    tenantId: payment.tenantId ?? "",
    paymentMethodId: payment.paymentMethodId ?? "",
    posSessionId: payment.posSessionId ?? "",
    amount: payment.amount ?? 0,
    transactionReference: payment.transactionReference ?? "",
  };
}

