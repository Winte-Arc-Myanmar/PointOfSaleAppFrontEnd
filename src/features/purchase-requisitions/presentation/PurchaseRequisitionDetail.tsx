"use client";

import Link from "next/link";
import { ClipboardList, Info, FilePlus } from "lucide-react";
import { usePurchaseRequisition } from "@/presentation/hooks/usePurchaseRequisitions";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function PurchaseRequisitionDetail({
  purchaseRequisitionId,
}: {
  purchaseRequisitionId: string;
}) {
  const { data: requisition, isLoading, error } =
    usePurchaseRequisition(purchaseRequisitionId);

  if (isLoading)
    return <AppLoader fullScreen={false} size="md" message="Loading purchase requisition..." />;
  if (error || !requisition) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Purchase requisition not found or failed to load.</p>
        <Link href="/purchase-requisitions">
          <Button variant="outline">Back to Purchase Requisitions</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Requisition ID", value: safeText(requisition.id), mono: true },
    { label: "Tenant ID", value: safeText(requisition.tenantId), mono: true },
    { label: "Department", value: safeText(requisition.department) },
    { label: "Status", value: safeText(requisition.status) },
    { label: "Requested by", value: safeText(requisition.requestedBy), mono: true },
    { label: "Justification", value: safeText(requisition.justification) },
  ];

  const timelineRows = [
    { label: "Created at", value: formatDate(requisition.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(requisition.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/purchase-requisitions"
        backLabel="Purchase Requisitions"
        title={safeText(requisition.department)}
        editHref={`/purchase-requisitions/${requisition.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/purchase-orders?requisitionId=${encodeURIComponent(String(requisition.id))}`}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <FilePlus className="h-4 w-4" />
            Create purchase order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ClipboardList}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Timeline" icon={Info}>
          <DetailRows rows={timelineRows} />
        </DetailSection>
      </div>
    </div>
  );
}
