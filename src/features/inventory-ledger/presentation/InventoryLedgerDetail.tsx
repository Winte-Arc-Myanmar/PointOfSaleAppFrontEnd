"use client";

import Link from "next/link";
import { useInventoryLedgerEntry } from "@/presentation/hooks/useInventoryLedger";
import { Button } from "@/presentation/components/ui/button";
import { Calendar, ClipboardList, Hash, Package, Warehouse } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function InventoryLedgerDetail({ entryId }: { entryId: string }) {
  const { data: row, isLoading, error } = useInventoryLedgerEntry(entryId);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading entry…" />;
  }
  if (error || !row) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Ledger entry not found.</p>
        <Link href="/inventory-ledger">
          <Button variant="outline">Back to inventory ledger</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Entry ID", value: safeText(row.id), mono: true },
    { label: "Transaction type", value: safeText(row.transactionType) },
    { label: "Reference ID", value: row.referenceId ? safeText(row.referenceId) : "—", mono: true },
  ];

  const linksRows = [
    { label: "Tenant ID", value: safeText(row.tenantId), mono: true },
    { label: "Location ID", value: safeText(row.locationId), mono: true },
    { label: "Variant ID", value: safeText(row.variantId), mono: true },
  ];

  const qtyRows = [
    { label: "Quantity", value: String(row.quantity) },
    { label: "Unit cost", value: String(row.unitCost) },
  ];

  const identityRows = [
    { label: "Serial number", value: row.serialNumber ? safeText(row.serialNumber) : "—" },
    { label: "Batch number", value: row.batchNumber ? safeText(row.batchNumber) : "—" },
  ];

  const datesRows = [
    { label: "Manufacturing date", value: row.manufacturingDate ?? "—" },
    { label: "Expiry date", value: row.expiryDate ?? "—" },
  ];

  const auditRows = [
    { label: "Created at", value: formatDate(row.createdAt) },
    { label: "Created by", value: row.createdBy ? safeText(row.createdBy) : "—", mono: true },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/inventory-ledger"
        backLabel="Inventory ledger"
        title={`${row.transactionType}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ClipboardList}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Links" icon={Warehouse}>
          <DetailRows rows={linksRows} />
        </DetailSection>
        <DetailSection title="Quantity & cost" icon={Package}>
          <DetailRows rows={qtyRows} />
        </DetailSection>
        <DetailSection title="Identifiers" icon={Hash}>
          <DetailRows rows={identityRows} />
        </DetailSection>
        <DetailSection title="Dates" icon={Calendar}>
          <DetailRows rows={datesRows} />
        </DetailSection>
        <DetailSection title="Audit" icon={Calendar}>
          <DetailRows rows={auditRows} />
        </DetailSection>
      </div>
    </div>
  );
}
