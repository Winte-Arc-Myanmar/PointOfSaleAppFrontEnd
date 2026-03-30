"use client";

import Link from "next/link";
import { useLocation } from "@/presentation/hooks/useLocations";
import { Button } from "@/presentation/components/ui/button";
import { Info, Warehouse } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function LocationDetail({ locationId }: { locationId: string }) {
  const { data: loc, isLoading, error } = useLocation(locationId);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading location..." />;
  }
  if (error || !loc) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Location not found or failed to load.</p>
        <Link href="/locations">
          <Button variant="outline">Back to locations</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Location ID", value: safeText(loc.id), mono: true },
    { label: "Name", value: safeText(loc.name) },
    { label: "Type", value: <span className="capitalize">{safeText(loc.type)}</span> },
    { label: "Tenant ID", value: safeText(loc.tenantId), mono: true },
    {
      label: "Parent location ID",
      value: loc.parentLocationId ? safeText(loc.parentLocationId) : "—",
      mono: true,
    },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(loc.createdAt) },
    { label: "Updated at", value: formatDate(loc.updatedAt) },
    ...(loc.deletedAt ? [{ label: "Deleted at", value: formatDate(loc.deletedAt) }] : []),
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/locations"
        backLabel="Locations"
        title={safeText(loc.name)}
        editHref={`/locations/${loc.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Warehouse}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
