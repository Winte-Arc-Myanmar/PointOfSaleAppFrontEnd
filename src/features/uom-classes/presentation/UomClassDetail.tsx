"use client";

import Link from "next/link";
import { useUomClass } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { Ruler } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function UomClassDetail({ uomClassId }: { uomClassId: string }) {
  const { data: uomClass, isLoading, error } = useUomClass(uomClassId);
  const overviewRows = uomClass
    ? [
        { label: "UOM Class ID", value: safeText(uomClass.id), mono: true },
        { label: "Name", value: safeText(uomClass.name) },
        { label: "Tenant ID", value: safeText(uomClass.tenantId), mono: true },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading UOM class..." />;
  if (error || !uomClass)
    return (
      <div className="space-y-4">
        <p className="text-red-500">UOM class not found or failed to load.</p>
        <Link href="/uom">
          <Button variant="outline">Back to UOM</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/uom"
        backLabel="UOM"
        title={safeText(uomClass.name)}
        editHref={`/uom-classes/${uomClass.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Ruler}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
      </div>
    </div>
  );
}
