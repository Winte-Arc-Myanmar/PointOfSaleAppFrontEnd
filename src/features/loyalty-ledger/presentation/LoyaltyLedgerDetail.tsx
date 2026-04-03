"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { useLoyaltyLedgerEntry } from "@/presentation/hooks/useLoyaltyLedger";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  safeText,
} from "@/presentation/components/detail";

export interface LoyaltyLedgerDetailProps {
  customerId: string;
  entryId: string;
  listHref?: string;
}

export function LoyaltyLedgerDetail({
  customerId,
  entryId,
  listHref: listHrefProp,
}: LoyaltyLedgerDetailProps) {
  const { data: entry, isLoading, error } = useLoyaltyLedgerEntry(
    customerId,
    entryId
  );

  const listHref =
    listHrefProp ?? `/customers/${customerId}/loyalty-ledger`;

  const rows = entry
    ? [
        { label: "Entry ID", value: safeText(entry.id), mono: true },
        { label: "Customer ID", value: safeText(entry.customerId), mono: true },
        { label: "Tenant ID", value: safeText(entry.tenantId), mono: true },
        { label: "Transaction type", value: safeText(entry.transactionType) },
        { label: "Points", value: safeText(entry.points), mono: true },
        {
          label: "Reference order ID",
          value: safeText(entry.referenceOrderId ?? "—"),
          mono: true,
        },
        {
          label: "Expiry date",
          value: safeText(entry.expiryDate ?? "—"),
        },
        {
          label: "Created",
          value: entry.createdAt
            ? new Date(entry.createdAt).toLocaleString()
            : "—",
        },
        {
          label: "Updated",
          value: entry.updatedAt
            ? new Date(entry.updatedAt).toLocaleString()
            : "—",
        },
      ]
    : [];

  if (isLoading)
    return (
      <AppLoader
        fullScreen={false}
        size="md"
        message="Loading loyalty entry..."
      />
    );

  if (error || !entry)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Entry not found or failed to load.</p>
        <Link href={listHref}>
          <Button variant="outline">Back to ledger</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={listHref}
        backLabel="Loyalty ledger"
        title={`${entry.transactionType} · ${entry.points} pts`}
        editHref={`${listHref}/${entry.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Details" icon={Gift}>
          <DetailRows rows={rows} />
        </DetailSection>
      </div>
    </div>
  );
}
