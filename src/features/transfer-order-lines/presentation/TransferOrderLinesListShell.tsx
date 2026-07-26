"use client";

import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { DetailPageHeader } from "@/presentation/components/detail";
import { useTransferOrder } from "@/presentation/hooks/useTransferOrders";
import { TransferOrderLineList } from "./TransferOrderLineList";

export function TransferOrderLinesListShell({
  transferOrderId,
}: {
  transferOrderId: string;
}) {
  const { data: order } = useTransferOrder(transferOrderId);
  const orderLabel = order?.transferNumber?.trim() || transferOrderId;

  return (
    <Shell>
      <div className="space-y-6">
        <DetailPageHeader
          backHref={`/transfer-orders/${transferOrderId}`}
          backLabel="Transfer Order"
          title={`Lines — ${orderLabel}`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/transfer-order-lines">
            <Button variant="outline" size="sm">
              All transfer orders
            </Button>
          </Link>
          <p className="page-description mb-0">
            Lines for: <span className="font-semibold text-foreground">{orderLabel}</span>
          </p>
        </div>
        <section>
          <h2 className="section-label mb-4">Transfer order lines</h2>
          <TransferOrderLineList transferOrderId={transferOrderId} />
        </section>
      </div>
    </Shell>
  );
}
