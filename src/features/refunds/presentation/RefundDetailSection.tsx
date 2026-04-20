"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailSection,
  DetailRows,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { useRefund } from "@/presentation/hooks/useRefunds";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export function RefundDetailSection({ refundId }: { refundId: string }) {
  const { data: refund, isLoading, error } = useRefund(refundId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading refund..." />;
  if (error || !refund) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Refund not found or failed to load.</p>
        <Link href="/refunds">
          <Button variant="outline">Back to refunds</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/refunds"
        backLabel="Refunds"
        title={safeText(refund.returnNumber || String(refund.returnId))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={RotateCcw}>
          <DetailRows
            rows={[
              { label: "Return ID", value: String(refund.returnId), mono: true },
              { label: "Return number", value: refund.returnNumber || "—" },
              { label: "Sales order ID", value: String(refund.salesOrderId), mono: true },
              { label: "Refund method", value: refund.refundMethod },
              { label: "Order status", value: refund.orderStatus },
              { label: "Created at", value: refund.createdAt ? formatDate(refund.createdAt) : "—" },
            ]}
          />
          <div className="mt-3">
            <Link href={`/sales-orders/${refund.salesOrderId}`}>
              <Button variant="outline">View sales order</Button>
            </Link>
          </div>
        </DetailSection>

        <DetailSection title="Totals" icon={RotateCcw}>
          <DetailRows
            rows={[
              { label: "Subtotal refund", value: money(refund.subtotalRefund) },
              { label: "Tax refund", value: money(refund.taxRefund) },
              { label: "Total refund", value: money(refund.totalRefund) },
              { label: "Reason", value: refund.reason || "—" },
            ]}
          />
        </DetailSection>
      </div>

      <DetailSection title="Refund lines" icon={RotateCcw}>
        {refund.lines.length === 0 ? (
          <p className="text-sm text-muted">No refund lines.</p>
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="p-3">Sales order line</th>
                  <th className="p-3">Returned qty</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Tax</th>
                  <th className="p-3">Line refund</th>
                </tr>
              </thead>
              <tbody>
                {refund.lines.map((l, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-mono text-xs text-muted">{String(l.salesOrderLineId)}</td>
                    <td className="p-3 text-muted">{l.returnedQuantity}</td>
                    <td className="p-3 text-muted">{money(l.unitPrice)}</td>
                    <td className="p-3 text-muted">{money(l.lineDiscount)}</td>
                    <td className="p-3 text-muted">{money(l.taxAmount)}</td>
                    <td className="p-3 font-medium">{money(l.lineRefund)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailSection>
    </div>
  );
}

