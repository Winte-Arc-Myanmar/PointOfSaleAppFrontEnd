"use client";

import Link from "next/link";
import { BadgePercent, Info } from "lucide-react";
import { useDiscountReason } from "@/presentation/hooks/useDiscountReasons";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function DiscountReasonDetail({ discountReasonId }: { discountReasonId: string }) {
  const { data: reason, isLoading, error } = useDiscountReason(discountReasonId);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading discount reason..." />;
  }
  if (error || !reason) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Discount reason not found or failed to load.</p>
        <Link href="/discount-reasons">
          <Button variant="outline">Back to Discount Reasons</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "ID", value: safeText(reason.id), mono: true },
    { label: "Tenant ID", value: safeText(reason.tenantId), mono: true },
    { label: "Code", value: safeText(reason.code) },
    { label: "Name", value: safeText(reason.name) },
    { label: "Description", value: safeText(reason.description) },
    { label: "Active", value: reason.isActive ? "Yes" : "No" },
    {
      label: "Requires manager override",
      value: reason.requiresManagerOverride ? "Yes" : "No",
    },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(reason.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(reason.updatedAt ?? undefined) },
    { label: "Deleted at", value: formatDate(reason.deletedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/discount-reasons"
        backLabel="Discount Reasons"
        title={safeText(reason.name)}
        editHref={`/discount-reasons/${reason.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={BadgePercent}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
