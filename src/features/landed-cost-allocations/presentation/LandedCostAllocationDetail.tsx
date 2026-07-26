"use client";

import Link from "next/link";
import { Info, Scale } from "lucide-react";
import { useLandedCostAllocation } from "@/presentation/hooks/useLandedCostAllocations";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function LandedCostAllocationDetail({
  allocationId,
}: {
  allocationId: string;
}) {
  const { data: allocation, isLoading, error } = useLandedCostAllocation(allocationId);

  if (isLoading)
    return (
      <AppLoader fullScreen={false} size="md" message="Loading landed cost allocation..." />
    );
  if (error || !allocation) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Landed cost allocation not found or failed to load.</p>
        <Link href="/landed-cost-allocations">
          <Button variant="outline">Back to Landed Cost Allocations</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Allocation ID", value: safeText(allocation.id), mono: true },
    { label: "Tenant ID", value: safeText(allocation.tenantId), mono: true },
    { label: "Source invoice ID", value: safeText(allocation.sourceInvoiceId), mono: true },
    { label: "Target GRN ID", value: safeText(allocation.targetGrnId), mono: true },
    {
      label: "Target GRN line ID",
      value: safeText(allocation.targetGrnLineId),
      mono: true,
    },
    { label: "Allocation method", value: safeText(allocation.allocationMethod) },
    {
      label: "Allocated amount",
      value: safeText(allocation.allocatedAmount),
      mono: true,
    },
    {
      label: "GL journal posted",
      value: allocation.glJournalPosted ? "Yes" : "No",
    },
  ];

  const timelineRows = [
    { label: "Created at", value: formatDate(allocation.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(allocation.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/landed-cost-allocations"
        backLabel="Landed Cost Allocations"
        title={`Allocation ${String(allocation.id).slice(0, 8)}…`}
        editHref={`/landed-cost-allocations/${allocation.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Scale}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Timeline" icon={Info}>
          <DetailRows rows={timelineRows} />
        </DetailSection>
      </div>
    </div>
  );
}
