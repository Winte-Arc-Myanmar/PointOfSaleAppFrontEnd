"use client";

import Link from "next/link";
import { ListTree, Info } from "lucide-react";
import { useMemo } from "react";
import { useGrnLine } from "@/presentation/hooks/useGrnLines";
import { useGoodsReceivedNote } from "@/presentation/hooks/useGoodsReceivedNotes";
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

export function GrnLineDetail({
  grnId,
  lineId,
}: {
  grnId: string;
  lineId: string;
}) {
  const { data: line, isLoading, error } = useGrnLine(grnId, lineId);
  const { data: note } = useGoodsReceivedNote(grnId);
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
        <p className="text-red-500">GRN line not found or failed to load.</p>
        <Link href={`/grn-lines/${grnId}`}>
          <Button variant="outline">Back to GRN Lines</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Line ID", value: safeText(line.id), mono: true },
    { label: "GRN ID", value: safeText(line.grnId), mono: true },
    { label: "PO line ID", value: safeText(line.poLineId), mono: true },
    { label: "Product", value: safeText(productName) },
    { label: "Product ID", value: safeText(line.productId), mono: true },
    { label: "Received quantity", value: safeText(line.receivedQuantity), mono: true },
    { label: "Accepted quantity", value: safeText(line.acceptedQuantity), mono: true },
    { label: "Rejected quantity", value: safeText(line.rejectedQuantity), mono: true },
    {
      label: "Inventory ledger posted",
      value: line.inventoryLedgerPosted ? "Yes" : "No",
    },
    { label: "Created at", value: formatDate(line.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(line.updatedAt ?? undefined) },
  ];

  const contextRows = note
    ? [
        { label: "GRN number", value: safeText(note.grnNumber) },
        { label: "Status", value: safeText(note.status) },
        { label: "Purchase order ID", value: safeText(note.purchaseOrderId), mono: true },
        {
          label: "Receiving location ID",
          value: safeText(note.receivingLocationId),
          mono: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={`/grn-lines/${grnId}`}
        backLabel="GRN Lines"
        title={safeText(productName)}
        editHref={`/grn-lines/${grnId}/${line.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Line details" icon={ListTree}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        {contextRows.length > 0 && (
          <DetailSection title="Goods received note" icon={Info}>
            <DetailRows rows={contextRows} />
          </DetailSection>
        )}
      </div>
    </div>
  );
}
