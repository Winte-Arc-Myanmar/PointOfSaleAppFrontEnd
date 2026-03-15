"use client";

import Link from "next/link";
import { useUom } from "@/presentation/hooks/useUoms";
import { Button } from "@/presentation/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      <div className="flex items-center gap-4">
        <Link href="/admin/uom">
          <Button variant="ghost" size="icon" aria-label="Back to UOM">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight text-foreground">
          {uom.name}
        </h1>
        <Link href={`/admin/uoms/${uom.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">UOM ID</dt>
          <dd className="font-mono text-xs">{uom.id}</dd>
        </div>
        <div>
          <dt className="text-muted">Name</dt>
          <dd className="font-medium">{uom.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Abbreviation</dt>
          <dd>{uom.abbreviation}</dd>
        </div>
        <div>
          <dt className="text-muted">Class ID</dt>
          <dd className="font-mono text-xs">{uom.classId}</dd>
        </div>
        <div>
          <dt className="text-muted">Conversion rate to base</dt>
          <dd>
            {typeof uom.conversionRateToBase === "number"
              ? uom.conversionRateToBase
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
