"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, UtensilsCrossed, Info, Pencil } from "lucide-react";
import { useDiningZone } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { FloorPlanCanvas } from "@/features/dining/shared/FloorPlanCanvas";
import { TableStatusTabs } from "@/features/dining/shared/TableStatusTabs";
import { countTablesByStatus } from "@/features/dining/shared/dining-ui";
import { useMemo, useState } from "react";
import type { DiningTableStatus } from "@/core/domain/entities/DiningTable";

export function DiningZoneDetail({ diningZoneId }: { diningZoneId: string }) {
  const router = useRouter();
  const { data: zone, isLoading, error } = useDiningZone(diningZoneId);
  const [statusFilter, setStatusFilter] = useState<DiningTableStatus | "ALL">("ALL");

  const { data: allTablesResult } = useDiningTables({
    page: 1,
    limit: 200,
    zoneId: diningZoneId,
    sortBy: "tableNumber",
    sortOrder: "asc",
  });

  const { data: tablesResult, isLoading: tablesLoading } = useDiningTables({
    page: 1,
    limit: 200,
    zoneId: diningZoneId,
    sortBy: "tableNumber",
    sortOrder: "asc",
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const tables = tablesResult?.items ?? [];
  const statusCounts = useMemo(
    () => countTablesByStatus(allTablesResult?.items ?? []),
    [allTablesResult?.items]
  );

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading zone..." />;
  if (error || !zone) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Dining zone not found or failed to load.</p>
        <Link href="/dining-zones">
          <Button variant="outline">Back to zones</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Zone name", value: safeText(zone.name) },
    { label: "Display order", value: String(zone.sortOrder) },
    { label: "Tables on floor", value: String(tablesResult?.total ?? tables.length) },
    { label: "Tenant ID", value: safeText(zone.tenantId), mono: true },
  ];

  const recordRows = [
    { label: "Zone ID", value: safeText(zone.id), mono: true },
    { label: "Created at", value: formatDate(zone.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(zone.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/dining-zones"
        backLabel="Dining Zones"
        title={safeText(zone.name)}
        editHref={`/dining-zones/${zone.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link href={`/dining-tables?zoneId=${zone.id}`}>
          <Button size="sm" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Open floor view
          </Button>
        </Link>
        <Link href={`/dining-zones/${zone.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit layout
          </Button>
        </Link>
      </div>

      <TableStatusTabs
        value={statusFilter}
        onChange={setStatusFilter}
        counts={statusCounts}
      />

      <DetailSection title="Live floor plan" icon={UtensilsCrossed}>
        {tablesLoading ? (
          <AppLoader fullScreen={false} size="sm" message="Loading tables..." />
        ) : (
          <FloorPlanCanvas
            zone={zone}
            tables={tables}
            onTableClick={(t) => router.push(`/dining-tables/${t.id}`)}
          />
        )}
      </DetailSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Zone overview" icon={UtensilsCrossed}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
