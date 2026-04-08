"use client";

import Link from "next/link";
import { Monitor, Info } from "lucide-react";
import { usePosRegister } from "@/presentation/hooks/usePosRegisters";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function PosRegisterDetail({ registerId }: { registerId: string }) {
  const { data: reg, isLoading, error } = usePosRegister(registerId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading register..." />;
  if (error || !reg) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">POS register not found or failed to load.</p>
        <Link href="/pos-registers">
          <Button variant="outline">Back to POS registers</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Register ID", value: safeText(reg.id), mono: true },
    { label: "Name", value: safeText(reg.name) },
    { label: "Tenant ID", value: safeText(reg.tenantId), mono: true },
    { label: "Location ID", value: safeText(reg.locationId), mono: true },
    { label: "MAC address", value: safeText(reg.macAddress), mono: true },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(reg.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(reg.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/pos-registers"
        backLabel="POS registers"
        title={safeText(reg.name)}
        editHref={`/pos-registers/${reg.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Monitor}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}

