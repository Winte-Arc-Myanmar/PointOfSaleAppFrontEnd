"use client";

import Link from "next/link";
import { LayoutGrid, Info, MapPin } from "lucide-react";
import { useDiningTable, useUpdateDiningTableStatus } from "@/presentation/hooks/useDiningTables";
import { useDiningZone } from "@/presentation/hooks/useDiningZones";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { DiningTableStatus } from "@/core/domain/entities/DiningTable";
import { StatusActionBar } from "@/features/dining/shared/StatusActionBar";
import { DiningTableTile } from "@/features/dining/shared/DiningTableTile";
import { getStatusConfig } from "@/features/dining/shared/dining-ui";

export function DiningTableDetail({ diningTableId }: { diningTableId: string }) {
  const toast = useToast();
  const { data: table, isLoading, error } = useDiningTable(diningTableId);
  const { data: zone } = useDiningZone(table?.zoneId ?? null);
  const updateStatus = useUpdateDiningTableStatus();

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading table..." />;
  if (error || !table) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Table not found or failed to load.</p>
        <Link href="/dining-tables">
          <Button variant="outline">Back to floor</Button>
        </Link>
      </div>
    );
  }

  const cfg = getStatusConfig(table.status);

  const serviceRows = [
    { label: "Zone", value: safeText(zone?.name ?? table.zoneId) },
    { label: "Table", value: safeText(table.tableNumber) },
    { label: "Seats", value: String(table.maxSeats) },
    { label: "Shape", value: safeText(table.shape) },
    { label: "Floor position", value: `${table.posX}, ${table.posY}`, mono: true },
    {
      label: "Current status",
      value: cfg.label,
    },
  ];

  const recordRows = [
    { label: "Table ID", value: safeText(table.id), mono: true },
    { label: "Tenant ID", value: safeText(table.tenantId), mono: true },
    { label: "Created at", value: formatDate(table.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(table.updatedAt ?? undefined) },
  ];

  const handleStatusChange = (status: DiningTableStatus) => {
    updateStatus.mutate(
      { id: String(table.id), status },
      {
        onSuccess: () => toast.success(`Table marked ${status.toLowerCase()}.`),
        onError: () => toast.error("Failed to update table status."),
      }
    );
  };

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={`/dining-tables?zoneId=${table.zoneId}`}
        backLabel="Floor"
        title={`Table ${safeText(table.tableNumber)}`}
        editHref={`/dining-tables/${table.id}/edit`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <DiningTableTile table={table} className="pointer-events-none" />
        <div>
          <p className="text-sm text-muted">{zone?.name ?? "Dining zone"}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{table.maxSeats} seats</p>
          <p className="text-sm font-medium mt-2 text-foreground">{cfg.label}</p>
        </div>
      </div>

      <DetailSection title="Change table status" icon={LayoutGrid}>
        <StatusActionBar
          value={table.status as DiningTableStatus}
          onChange={handleStatusChange}
          disabled={updateStatus.isPending}
        />
      </DetailSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Service info" icon={MapPin}>
          <DetailRows rows={serviceRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
