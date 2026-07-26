"use client";

import Link from "next/link";
import { ArrowLeftRight, Info, ListTree } from "lucide-react";
import { useTransferOrder } from "@/presentation/hooks/useTransferOrders";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function TransferOrderDetail({ transferOrderId }: { transferOrderId: string }) {
  const { data: order, isLoading, error } = useTransferOrder(transferOrderId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading transfer order..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Transfer order not found or failed to load.</p>
        <Link href="/transfer-orders">
          <Button variant="outline">Back to Transfer Orders</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Transfer order ID", value: safeText(order.id), mono: true },
    { label: "Tenant ID", value: safeText(order.tenantId), mono: true },
    { label: "Transfer number", value: safeText(order.transferNumber) },
    { label: "Status", value: safeText(order.status) },
    { label: "Source location ID", value: safeText(order.sourceLocationId), mono: true },
    { label: "Transit location ID", value: safeText(order.transitLocationId), mono: true },
    { label: "Destination location ID", value: safeText(order.destinationLocationId), mono: true },
    { label: "Created by", value: safeText(order.createdBy), mono: true },
  ];

  const timelineRows = [
    { label: "Shipped at", value: formatDate(order.shippedAt ?? undefined) },
    { label: "Received at", value: formatDate(order.receivedAt ?? undefined) },
    { label: "Created at", value: formatDate(order.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(order.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/transfer-orders"
        backLabel="Transfer Orders"
        title={safeText(order.transferNumber)}
        editHref={`/transfer-orders/${order.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link href={`/transfer-order-lines/${order.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ListTree className="h-4 w-4" />
            View transfer order lines
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ArrowLeftRight}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Timeline" icon={Info}>
          <DetailRows rows={timelineRows} />
        </DetailSection>
      </div>
    </div>
  );
}
