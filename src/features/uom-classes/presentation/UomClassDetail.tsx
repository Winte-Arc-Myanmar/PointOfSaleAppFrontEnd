"use client";

import Link from "next/link";
import { useUomClass } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function UomClassDetail({ uomClassId }: { uomClassId: string }) {
  const { data: uomClass, isLoading, error } = useUomClass(uomClassId);

  if (isLoading) return <p className="text-muted">Loading UOM class...</p>;
  if (error || !uomClass)
    return (
      <div className="space-y-4">
        <p className="text-red-500">UOM class not found or failed to load.</p>
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
          {uomClass.name}
        </h1>
        <Link href={`/admin/uom-classes/${uomClass.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">UOM Class ID</dt>
          <dd className="font-mono text-xs">{uomClass.id}</dd>
        </div>
        <div>
          <dt className="text-muted">Name</dt>
          <dd className="font-medium">{uomClass.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Tenant ID</dt>
          <dd className="font-mono text-xs">{uomClass.tenantId}</dd>
        </div>
      </dl>
    </div>
  );
}
