"use client";

import Link from "next/link";
import { useUom } from "@/presentation/hooks/useUoms";
import { Button } from "@/presentation/components/ui/button";
import { Ruler, Tag } from "lucide-react";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";

export function UomDetail({ uomId }: { uomId: string }) {
  const { data: uom, isLoading, error } = useUom(uomId);

  if (isLoading) return <p className="text-muted">Loading UOM...</p>;
  if (error || !uom)
    return (
      <div className="space-y-4">
        <p className="text-red-500">UOM not found or failed to load.</p>
        <Link href="/admin/uom">
          <Button variant="outline">Back to UOM</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/admin/uom"
        backLabel="UOM"
        title={safeText(uom.name)}
        editHref={`/admin/uoms/${uom.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Ruler}>
          <div className="space-y-0">
            <DetailRow label="UOM ID" value={safeText(uom.id)} mono />
            <DetailRow label="Name" value={safeText(uom.name)} />
            <DetailRow label="Abbreviation" value={safeText(uom.abbreviation)} />
          </div>
        </DetailSection>

        <DetailSection title="Class & conversion" icon={Tag}>
          <div className="space-y-0">
            <DetailRow label="Class ID" value={safeText(uom.classId)} mono />
            <DetailRow
              label="Conversion rate to base"
              value={
                typeof uom.conversionRateToBase === "number"
                  ? String(uom.conversionRateToBase)
                  : "—"
              }
            />
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
