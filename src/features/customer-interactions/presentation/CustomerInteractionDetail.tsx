"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { useCustomerInteraction } from "@/presentation/hooks/useCustomerInteractions";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  safeText,
} from "@/presentation/components/detail";

export interface CustomerInteractionDetailProps {
  customerId: string;
  interactionId: string;
  listHref?: string;
}

export function CustomerInteractionDetail({
  customerId,
  interactionId,
  listHref: listHrefProp,
}: CustomerInteractionDetailProps) {
  const { data: row, isLoading, error } = useCustomerInteraction(
    customerId,
    interactionId
  );

  const listHref =
    listHrefProp ?? `/customers/${customerId}/interactions`;

  const detailRows = row
    ? [
        { label: "Interaction ID", value: safeText(row.id), mono: true },
        { label: "Customer ID", value: safeText(row.customerId), mono: true },
        { label: "Tenant ID", value: safeText(row.tenantId), mono: true },
        { label: "Agent ID", value: safeText(row.agentId), mono: true },
        { label: "Channel", value: safeText(row.interactionChannel) },
        { label: "Type", value: safeText(row.interactionType) },
        { label: "Summary", value: safeText(row.summary) },
        {
          label: "Detailed notes",
          value: safeText(row.detailedNotes || "—"),
        },
        {
          label: "External reference",
          value: safeText(row.externalReferenceId ?? "—"),
          mono: true,
        },
        {
          label: "Interaction date",
          value: row.interactionDate
            ? new Date(row.interactionDate).toLocaleString()
            : "—",
        },
        {
          label: "Updated",
          value: row.updatedAt
            ? new Date(row.updatedAt).toLocaleString()
            : "—",
        },
      ]
    : [];

  if (isLoading)
    return (
      <AppLoader
        fullScreen={false}
        size="md"
        message="Loading interaction..."
      />
    );

  if (error || !row)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Interaction not found or failed to load.</p>
        <Link href={listHref}>
          <Button variant="outline">Back to interactions</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={listHref}
        backLabel="Interactions"
        title={safeText(row.summary)}
        editHref={`${listHref}/${row.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Details" icon={MessageSquareText}>
          <DetailRows rows={detailRows} />
        </DetailSection>
      </div>
    </div>
  );
}
