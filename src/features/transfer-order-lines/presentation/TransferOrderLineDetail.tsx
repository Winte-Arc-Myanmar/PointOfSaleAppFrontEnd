"use client";

import Link from "next/link";
import { ListTree, Info } from "lucide-react";
import { useMemo } from "react";
import { useTransferOrderLine } from "@/presentation/hooks/useTransferOrderLines";
import { useTransferOrder } from "@/presentation/hooks/useTransferOrders";
import { useProducts } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

export function TransferOrderLineDetail({
  transferOrderId,
  lineId,
}: {
  transferOrderId: string;
  lineId: string;
}) {
  const { data: line, isLoading, error } = useTransferOrderLine(transferOrderId, lineId);
  const { data: order } = useTransferOrder(transferOrderId);
  const { data: productsData } = useProducts({ page: 1, limit: 200 });
  const products = getPaginatedItems(productsData);

  const productName = useMemo(() => {
    if (!line) return "";
    return products.find((p) => String(p.id) === String(line.productId))?.name ?? line.productId;
  }, [line, products]);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading line..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Transfer order line not found or failed to load.</p>
        <Link href={`/transfer-order-lines/${transferOrderId}`}>
          <Button variant="outline">Back to Transfer Order Lines</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Line ID", value: safeText(line.id), mono: true },
    { label: "Transfer order ID", value: safeText(line.transferOrderId), mono: true },
    { label: "Product", value: safeText(productName) },
    { label: "Product ID", value: safeText(line.productId), mono: true },
    { label: "Requested quantity", value: safeText(line.requestedQuantity), mono: true },
    { label: "Shipped quantity", value: safeText(line.shippedQuantity), mono: true },
    { label: "Received quantity", value: safeText(line.receivedQuantity), mono: true },
    { label: "Created at", value: formatDate(line.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(line.updatedAt ?? undefined) },
  ];

  const contextRows = order
    ? [
        { label: "Transfer number", value: safeText(order.transferNumber) },
        { label: "Status", value: safeText(order.status) },
        { label: "Source location ID", value: safeText(order.sourceLocationId), mono: true },
        {
          label: "Destination location ID",
          value: safeText(order.destinationLocationId),
          mono: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={`/transfer-order-lines/${transferOrderId}`}
        backLabel="Transfer Order Lines"
        title={safeText(productName)}
        editHref={`/transfer-order-lines/${transferOrderId}/${line.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Line details" icon={ListTree}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        {contextRows.length > 0 && (
          <DetailSection title="Transfer order" icon={Info}>
            <DetailRows rows={contextRows} />
          </DetailSection>
        )}
      </div>
    </div>
  );
}
