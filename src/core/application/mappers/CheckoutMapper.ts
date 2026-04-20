import type { CheckoutResult } from "@/core/domain/entities/CheckoutResult";
import type {
  CheckoutResultDto,
  CheckoutLineResultDto,
  CheckoutPaymentResultDto,
} from "@/core/application/dtos/CheckoutDto";

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

function mapLine(dto: CheckoutLineResultDto | undefined) {
  return {
    id: dto?.id,
    variantId: dto?.variantId,
    quantity: parseDecimal(dto?.quantity),
    unitPrice: parseDecimal(dto?.unitPrice),
    lineDiscount: parseDecimal(dto?.lineDiscount),
    taxAmount: parseDecimal(dto?.taxAmount),
    lineTotal: parseDecimal(dto?.lineTotal),
  };
}

function mapPayment(dto: CheckoutPaymentResultDto | undefined) {
  return {
    id: dto?.id,
    paymentMethodId: dto?.paymentMethodId,
    amount: parseDecimal(dto?.amount),
    transactionReference: dto?.transactionReference ?? null,
    paymentDate: dto?.paymentDate ?? null,
  };
}

export function toCheckoutResult(dto: CheckoutResultDto): CheckoutResult {
  return {
    orderId: dto.orderId,
    orderNumber: dto.orderNumber ?? "",
    grandTotal: parseDecimal(dto.grandTotal),
    totalPaid: parseDecimal(dto.totalPaid),
    change: parseDecimal(dto.change),
    status: dto.status ?? "",
    lines: Array.isArray(dto.lines) ? dto.lines.map((l) => mapLine(l)) : [],
    payments: Array.isArray(dto.payments)
      ? dto.payments.map((p) => mapPayment(p))
      : [],
  };
}

