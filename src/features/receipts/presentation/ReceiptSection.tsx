"use client";

import Link from "next/link";
import { ReceiptText, Printer } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { DetailPageHeader, DetailSection, DetailRows, formatDate } from "@/presentation/components/detail";
import { useReceipt } from "@/presentation/hooks/useReceipts";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export function ReceiptSection({ salesOrderId }: { salesOrderId: string }) {
  const { data: receipt, isLoading, error, refetch } = useReceipt(salesOrderId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading receipt..." />;
  if (error || !receipt) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Receipt not found or failed to load.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href={`/sales-orders/${salesOrderId}`}>
            <Button variant="outline">Back to order</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div data-print-receipt className="space-y-6">
        <DetailPageHeader
          backHref={`/sales-orders/${salesOrderId}`}
          backLabel="Sales order"
          title={receipt.orderInfo.receiptNumber || "Receipt"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DetailSection title="Header" icon={ReceiptText}>
            <DetailRows
              rows={[
                { label: "Business", value: receipt.header.businessName },
                { label: "Legal name", value: receipt.header.legalName ?? "—" },
                { label: "Phone", value: receipt.header.phone ?? "—" },
                { label: "Email", value: receipt.header.email ?? "—" },
                { label: "Website", value: receipt.header.website ?? "—" },
                {
                  label: "Address",
                  value: [
                    receipt.header.address,
                    receipt.header.city,
                    receipt.header.state,
                    receipt.header.zipCode,
                    receipt.header.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—",
                },
              ]}
            />
          </DetailSection>

          <DetailSection title="Order info" icon={ReceiptText}>
            <DetailRows
              rows={[
                { label: "Receipt #", value: receipt.orderInfo.receiptNumber },
                { label: "Order #", value: receipt.orderInfo.orderNumber },
                {
                  label: "Date",
                  value: receipt.orderInfo.dateTime
                    ? formatDate(receipt.orderInfo.dateTime)
                    : "—",
                },
                { label: "Channel", value: receipt.orderInfo.salesChannel ?? "—" },
                { label: "Location", value: receipt.orderInfo.locationName ?? "—" },
              ]}
            />
          </DetailSection>

          <DetailSection title="Totals" icon={ReceiptText}>
            <DetailRows
              rows={[
                { label: "Subtotal", value: money(receipt.totals.subtotal) },
                { label: "Discount", value: money(receipt.totals.totalDiscount) },
                { label: "Tax", value: money(receipt.totals.totalTax) },
                { label: "Grand total", value: money(receipt.totals.grandTotal) },
              ]}
            />
          </DetailSection>

          <DetailSection title="Payments" icon={ReceiptText}>
            <DetailRows
              rows={[
                { label: "Total paid", value: money(receipt.paymentSummary.totalPaid) },
                { label: "Change due", value: money(receipt.paymentSummary.changeDue) },
                {
                  label: "Breakdown",
                  value:
                    receipt.paymentSummary.payments.length === 0
                      ? "—"
                      : receipt.paymentSummary.payments
                          .map((p) => `${p.methodName}: ${money(p.amount)}`)
                          .join(" · "),
                },
              ]}
            />
          </DetailSection>
        </div>

        <DetailSection title="Line items" icon={ReceiptText}>
          {receipt.lineItems.length === 0 ? (
            <p className="text-sm text-muted">No line items.</p>
          ) : (
            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="p-3">Product</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Tax</th>
                    <th className="p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.lineItems.map((li, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-3">{li.productName}</td>
                      <td className="p-3 text-muted">{li.variantSku ?? "—"}</td>
                      <td className="p-3 text-muted">{li.quantity}</td>
                      <td className="p-3 text-muted">{money(li.unitPrice)}</td>
                      <td className="p-3 text-muted">{money(li.lineDiscount)}</td>
                      <td className="p-3 text-muted">{money(li.taxAmount)}</td>
                      <td className="p-3 font-medium">{money(li.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailSection>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.print()}
          className="print:hidden"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Link href={`/refunds?salesOrderId=${encodeURIComponent(salesOrderId)}`}>
          <Button type="button" variant="outline" className="print:hidden">
            Start refund
          </Button>
        </Link>
      </div>
    </div>
  );
}

