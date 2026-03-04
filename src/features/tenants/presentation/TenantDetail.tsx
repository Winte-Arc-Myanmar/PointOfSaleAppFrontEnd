"use client";

import Link from "next/link";
import { useTenant } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function TenantDetail({ tenantId }: { tenantId: string }) {
  const { data: tenant, isLoading, error } = useTenant(tenantId);

  if (isLoading) return <p className="text-muted">Loading tenant...</p>;
  if (error || !tenant)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tenant not found or failed to load.</p>
        <Link href="/admin/tenants">
          <Button variant="outline">Back to Tenants</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tenants">
          <Button variant="ghost" size="icon" aria-label="Back to tenants">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{tenant.name}</h1>
        <Link href={`/admin/tenants/${tenant.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><dt className="text-muted">Legal name</dt><dd className="font-medium">{tenant.legalName}</dd></div>
        <div><dt className="text-muted">Domain</dt><dd>{tenant.domain}</dd></div>
        <div><dt className="text-muted">Website</dt><dd><a href={tenant.website} target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">{tenant.website || "—"}</a></dd></div>
        <div><dt className="text-muted">Primary contact</dt><dd>{tenant.primaryContactName || "—"}</dd></div>
        <div><dt className="text-muted">Contact email</dt><dd>{tenant.primaryContactEmail || "—"}</dd></div>
        <div><dt className="text-muted">Contact phone</dt><dd>{tenant.primaryContactPhone || "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Address</dt><dd>{tenant.address}, {tenant.city} {tenant.state} {tenant.zipCode}, {tenant.country}</dd></div>
      </dl>
    </div>
  );
}
