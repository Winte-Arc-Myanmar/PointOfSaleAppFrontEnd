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
        "mx-auto rounded-lg border border-border bg-white p-3 text-center font-mono text-[12px] font-black leading-relaxed text-black shadow-sm",
        paperWidthMm === 58 ? "w-[58mm] max-w-full" : "w-[80mm] max-w-full",
        className,
      )}
    >
      <div className="space-y-1 text-center">
        <p className="text-[11px] uppercase tracking-[0.22em]">Paid Receipt</p>
        <p className="text-base font-black uppercase">
          {receipt.header.businessName}
        </p>
        {receipt.header.legalName ? <p>{receipt.header.legalName}</p> : null}
        {address ? <p>{address}</p> : null}
        {receipt.header.phone ? <p>Tel: {receipt.header.phone}</p> : null}
      </div>

      <div className="my-2 border-t-2 border-black" />

      <div className="space-y-0.5 rounded-sm border border-black px-2 py-1">
        <p>Receipt: {receipt.orderInfo.receiptNumber}</p>
        <p>Order: {receipt.orderInfo.orderNumber}</p>
        <p>Date: {formatDateTime(receipt.orderInfo.dateTime)}</p>
        {receipt.orderInfo.locationName ? (
          <p>Loc: {receipt.orderInfo.locationName}</p>
        ) : null}
        {receipt.customer?.name ? <p>Guest: {receipt.customer.name}</p> : null}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="space-y-2">
        <div className="grid grid-cols-[44px_1fr_58px] gap-1 border-b border-black pb-1 text-center text-[11px] uppercase tracking-wide">
          <span>Qty</span>
          <span>Item</span>
          <span>Amount</span>
        </div>
        {receipt.lineItems.map((item, index) => (
          <div
            key={`${item.productName}-${index}`}
            className="border-b border-dashed border-black/50 pb-1 last:border-b-0"
          >
            <div className="grid grid-cols-[44px_1fr_58px] gap-1 text-center">
              <span>{item.quantity}x</span>
              <span className="uppercase leading-snug">{item.productName}</span>
              <span>{money(item.lineTotal)}</span>
            </div>
            <p className="text-[11px]">@ {money(item.unitPrice)} each</p>
            {item.variantSku ? (
              <p className="text-[11px]">SKU: {item.variantSku}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="my-2 border-t-2 border-black" />

      <div className="space-y-0.5">
        <p>Subtotal {money(receipt.totals.subtotal)}</p>
        {receipt.totals.totalDiscount > 0 ? (
          <p>Discount -{money(receipt.totals.totalDiscount)}</p>
        ) : null}
        {receipt.taxSummary.length > 0
          ? receipt.taxSummary.map((tax, index) => (
              <p key={`${tax.taxName}-${index}`}>
                {tax.taxName} {tax.ratePercentage}% {money(tax.taxAmount)}
              </p>
            ))
          : receipt.totals.totalTax > 0 && (
              <p>Tax {money(receipt.totals.totalTax)}</p>
            )}
        <p className="mt-2 border-y-2 border-black py-1 text-base font-black">
          TOTAL {money(receipt.totals.grandTotal)}
        </p>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="space-y-0.5">
        <p className="mb-1 text-center text-[11px] uppercase tracking-[0.22em]">
          Payment
        </p>
        {receipt.paymentSummary.payments.map((payment, index) => (
          <p key={`${payment.methodName}-${index}`}>
            {payment.methodName} {money(payment.amount)}
          </p>
        ))}
        <p>Paid {money(receipt.paymentSummary.totalPaid)}</p>
        {receipt.paymentSummary.changeDue > 0 ? (
          <p>Change {money(receipt.paymentSummary.changeDue)}</p>
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

      <p className="mt-3 border-t-2 border-black pt-2 text-center text-sm font-black uppercase">
        Thank you!
      </p>
    </div>
  );
}
