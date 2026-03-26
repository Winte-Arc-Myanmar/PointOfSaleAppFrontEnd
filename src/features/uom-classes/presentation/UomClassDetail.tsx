"use client";

import Link from "next/link";
import { useUomClass } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { Ruler } from "lucide-react";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function UomClassDetail({ uomClassId }: { uomClassId: string }) {
  const { data: uomClass, isLoading, error } = useUomClass(uomClassId);

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
          <div className="space-y-0">
            <DetailRow label="UOM Class ID" value={safeText(uomClass.id)} mono />
            <DetailRow label="Name" value={safeText(uomClass.name)} />
            <DetailRow label="Tenant ID" value={safeText(uomClass.tenantId)} mono />
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
