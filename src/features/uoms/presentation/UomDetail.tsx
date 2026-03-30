"use client";

import Link from "next/link";
import { useUom } from "@/presentation/hooks/useUoms";
import { Button } from "@/presentation/components/ui/button";
import { Ruler, Tag } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function UomDetail({ uomId }: { uomId: string }) {
  const { data: uom, isLoading, error } = useUom(uomId);
  const overviewRows = uom
    ? [
        { label: "UOM ID", value: safeText(uom.id), mono: true },
        { label: "Name", value: safeText(uom.name) },
        { label: "Abbreviation", value: safeText(uom.abbreviation) },
      ]
    : [];
  const classRows = uom
    ? [
        { label: "Class ID", value: safeText(uom.classId), mono: true },
        {
          label: "Conversion rate to base",
          value:
            typeof uom.conversionRateToBase === "number"
              ? String(uom.conversionRateToBase)
              : "—",
        },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading UOM..." />;
  if (error || !uom)
    return (
      <div className="space-y-4">
        <p className="text-red-500">UOM not found or failed to load.</p>
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
        title={safeText(uom.name)}
        editHref={`/uoms/${uom.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Ruler}>
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Class & conversion" icon={Tag}>
          <DetailRows rows={classRows} />
        </DetailSection>
      </div>
    </div>
  );
}
