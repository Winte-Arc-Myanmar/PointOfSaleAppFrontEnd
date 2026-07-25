"use client";

import type { Receipt } from "@/core/domain/entities/Receipt";
import { cn } from "@/lib/utils";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

/**
 * Narrow monospace receipt preview sized for 58mm / 80mm thermal paper.
 */
export function ThermalReceiptView({
  receipt,
  paperWidthMm = 80,
  className,
}: {
  receipt: Receipt;
  paperWidthMm?: 58 | 80;
  className?: string;
}) {
  const address = [
    receipt.header.address,
    receipt.header.city,
    receipt.header.state,
    receipt.header.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      data-thermal-receipt
      data-paper-width={paperWidthMm}
      className={cn(
        "mx-auto rounded-lg border border-border bg-white p-3 font-mono text-[12px] leading-relaxed text-black shadow-sm",
        paperWidthMm === 58 ? "w-[58mm] max-w-full" : "w-[80mm] max-w-full",
        className,
      )}
    >
      <div className="space-y-1 text-center">
        <p className="text-sm font-bold">{receipt.header.businessName}</p>
        {receipt.header.legalName ? <p>{receipt.header.legalName}</p> : null}
        {address ? <p>{address}</p> : null}
        {receipt.header.phone ? <p>Tel: {receipt.header.phone}</p> : null}
      </div>

      <div className="my-2 border-t border-dashed border-black/40" />

      <div className="space-y-0.5">
        <p>Receipt: {receipt.orderInfo.receiptNumber}</p>
        <p>Order: {receipt.orderInfo.orderNumber}</p>
        <p>Date: {formatDateTime(receipt.orderInfo.dateTime)}</p>
        {receipt.orderInfo.locationName ? (
          <p>Loc: {receipt.orderInfo.locationName}</p>
        ) : null}
        {receipt.customer?.name ? <p>Guest: {receipt.customer.name}</p> : null}
      </div>

      <div className="my-2 border-t border-dashed border-black/40" />

      <div className="space-y-2">
        {receipt.lineItems.map((item, index) => (
          <div key={`${item.productName}-${index}`}>
            <div className="flex justify-between gap-2">
              <span>
                {item.quantity} x {money(item.unitPrice)}
              </span>
              <span>{money(item.lineTotal)}</span>
            </div>
            <p>{item.productName}</p>
            {item.variantSku ? (
              <p className="text-black/70">SKU: {item.variantSku}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="my-2 border-t border-dashed border-black/40" />

      <div className="space-y-0.5">
        <div className="flex justify-between gap-2">
          <span>Subtotal</span>
          <span>{money(receipt.totals.subtotal)}</span>
        </div>
        {receipt.totals.totalDiscount > 0 ? (
          <div className="flex justify-between gap-2">
            <span>Discount</span>
            <span>-{money(receipt.totals.totalDiscount)}</span>
          </div>
        ) : null}
        {receipt.taxSummary.length > 0
          ? receipt.taxSummary.map((tax, index) => (
              <div
                key={`${tax.taxName}-${index}`}
                className="flex justify-between gap-2"
              >
                <span>
                  {tax.taxName} {tax.ratePercentage}%
                </span>
                <span>{money(tax.taxAmount)}</span>
              </div>
            ))
          : receipt.totals.totalTax > 0 && (
              <div className="flex justify-between gap-2">
                <span>Tax</span>
                <span>{money(receipt.totals.totalTax)}</span>
              </div>
            )}
        <div className="mt-1 flex justify-between gap-2 border-t border-black pt-1 text-sm font-bold">
          <span>TOTAL</span>
          <span>{money(receipt.totals.grandTotal)}</span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-black/40" />

      <div className="space-y-0.5">
        {receipt.paymentSummary.payments.map((payment, index) => (
          <div
            key={`${payment.methodName}-${index}`}
            className="flex justify-between gap-2"
          >
            <span>{payment.methodName}</span>
            <span>{money(payment.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-2">
          <span>Paid</span>
          <span>{money(receipt.paymentSummary.totalPaid)}</span>
        </div>
        {receipt.paymentSummary.changeDue > 0 ? (
          <div className="flex justify-between gap-2">
            <span>Change</span>
            <span>{money(receipt.paymentSummary.changeDue)}</span>
          </div>
        ) : null}
      </div>

      {(receipt.footer?.message || receipt.footer?.returnPolicy) && (
        <>
          <div className="my-2 border-t border-dashed border-black/40" />
          <div className="space-y-1 text-center">
            {receipt.footer.message ? <p>{receipt.footer.message}</p> : null}
            {receipt.footer.returnPolicy ? (
              <p>{receipt.footer.returnPolicy}</p>
            ) : null}
          </div>
        </>
      )}

      <p className="mt-3 text-center font-bold">Thank you!</p>
    </div>
  );
}
