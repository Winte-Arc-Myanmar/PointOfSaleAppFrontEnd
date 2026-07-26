"use client";

import Link from "next/link";
import { ShoppingCart, Info } from "lucide-react";
import { usePurchaseOrder } from "@/presentation/hooks/usePurchaseOrders";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function PurchaseOrderDetail({ purchaseOrderId }: { purchaseOrderId: string }) {
  const { data: order, isLoading, error } = usePurchaseOrder(purchaseOrderId);

  if (isLoading)
    return <AppLoader fullScreen={false} size="md" message="Loading purchase order..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Purchase order not found or failed to load.</p>
        <Link href="/purchase-orders">
          <Button variant="outline">Back to Purchase Orders</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Purchase order ID", value: safeText(order.id), mono: true },
    { label: "Tenant ID", value: safeText(order.tenantId), mono: true },
    { label: "PO number", value: safeText(order.poNumber) },
    { label: "Status", value: safeText(order.status) },
    { label: "Vendor ID", value: safeText(order.vendorId), mono: true },
    { label: "Requisition ID", value: safeText(order.requisitionId), mono: true },
    { label: "Currency", value: safeText(order.currency) },
    { label: "Total amount", value: safeText(order.totalAmount), mono: true },
    { label: "Expected delivery", value: formatDate(order.expectedDeliveryDate) },
  ];

  const timelineRows = [
    { label: "Created at", value: formatDate(order.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(order.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/purchase-orders"
        backLabel="Purchase Orders"
        title={safeText(order.poNumber)}
        editHref={`/purchase-orders/${order.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ShoppingCart}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Timeline" icon={Info}>
          <DetailRows rows={timelineRows} />
        </DetailSection>
      </div>
    </div>
  );
}
