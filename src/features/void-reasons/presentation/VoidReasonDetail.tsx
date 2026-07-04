"use client";

import Link from "next/link";
import { Ban, Info } from "lucide-react";
import { useVoidReason } from "@/presentation/hooks/useVoidReasons";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function VoidReasonDetail({ voidReasonId }: { voidReasonId: string }) {
  const { data: reason, isLoading, error } = useVoidReason(voidReasonId);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading void reason..." />;
  }
  if (error || !reason) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Void reason not found or failed to load.</p>
        <Link href="/void-reasons">
          <Button variant="outline">Back to Void Reasons</Button>
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
        backHref="/void-reasons"
        backLabel="Void Reasons"
        title={safeText(reason.name)}
        editHref={`/void-reasons/${reason.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Ban}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
