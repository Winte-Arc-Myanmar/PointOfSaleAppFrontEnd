import type { Receipt } from "@/core/domain/entities/Receipt";
import type { ReceiptDto } from "@/core/application/dtos/ReceiptDto";

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

export function toReceipt(dto: ReceiptDto): Receipt {
  const header = dto.header ?? {};
  const orderInfo = dto.orderInfo ?? {};
  const totals = dto.totals ?? {};
  const paymentSummary = dto.paymentSummary ?? {};

  return {
    header: {
      businessName: header.businessName ?? "",
      legalName: header.legalName,
      logoUrl: header.logoUrl,
      address: header.address,
      city: header.city,
      state: header.state,
      country: header.country,
      zipCode: header.zipCode,
      phone: header.phone,
      email: header.email,
      website: header.website,
    },
    orderInfo: {
      receiptNumber: orderInfo.receiptNumber ?? "",
      orderNumber: orderInfo.orderNumber ?? "",
      dateTime: orderInfo.dateTime,
      salesChannel: orderInfo.salesChannel,
      locationName: orderInfo.locationName,
    },
    customer: dto.customer
      ? {
          name: dto.customer.name,
          phone: dto.customer.phone,
          email: dto.customer.email,
          loyaltyTier: dto.customer.loyaltyTier,
          pointsEarned:
            dto.customer.pointsEarned == null ? undefined : parseDecimal(dto.customer.pointsEarned),
        }
      : undefined,
    lineItems: Array.isArray(dto.lineItems)
      ? dto.lineItems.map((li) => ({
          productName: li.productName ?? "",
          variantSku: li.variantSku,
          barcode: li.barcode,
          variantOptions: li.variantOptions,
          quantity: parseDecimal(li.quantity),
          unitPrice: parseDecimal(li.unitPrice),
          lineDiscount: parseDecimal(li.lineDiscount),
          taxAmount: parseDecimal(li.taxAmount),
          lineTotal: parseDecimal(li.lineTotal),
        }))
      : [],
    taxSummary: Array.isArray(dto.taxSummary)
      ? dto.taxSummary.map((t) => ({
          taxName: t.taxName ?? "",
          ratePercentage: parseDecimal(t.ratePercentage),
          taxableAmount: parseDecimal(t.taxableAmount),
          taxAmount: parseDecimal(t.taxAmount),
        }))
      : [],
    totals: {
      subtotal: parseDecimal(totals.subtotal),
      totalDiscount: parseDecimal(totals.totalDiscount),
      totalTax: parseDecimal(totals.totalTax),
      grandTotal: parseDecimal(totals.grandTotal),
    },
    paymentSummary: {
      payments: Array.isArray(paymentSummary.payments)
        ? paymentSummary.payments.map((p) => ({
            methodName: p.methodName ?? "",
            amount: parseDecimal(p.amount),
            transactionReference: p.transactionReference ?? null,
            paymentDate: p.paymentDate ?? null,
          }))
        : [],
      totalPaid: parseDecimal(paymentSummary.totalPaid),
      changeDue: parseDecimal(paymentSummary.changeDue),
    },
    footer: dto.footer
      ? {
          message: dto.footer.message,
          returnPolicy: dto.footer.returnPolicy,
        }
      : undefined,
  };
}

