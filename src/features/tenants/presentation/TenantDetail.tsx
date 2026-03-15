"use client";

import Link from "next/link";
import Image from "next/image";
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

  const addressParts = [
    tenant.address,
    tenant.city,
    tenant.state,
    tenant.zipCode,
    tenant.country,
  ].filter(Boolean);
  const addressLine = addressParts.length > 0 ? addressParts.join(", ") : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tenants">
          <Button variant="ghost" size="icon" aria-label="Back to tenants">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight text-foreground">
          {tenant.name}
        </h1>
        <Link href={`/admin/tenants/${tenant.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Tenant ID</dt>
          <dd className="font-mono text-xs">{tenant.id}</dd>
        </div>
        <div>
          <dt className="text-muted">Name</dt>
          <dd className="font-medium">{tenant.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Legal name</dt>
          <dd>{tenant.legalName}</dd>
        </div>
        <div>
          <dt className="text-muted">Domain</dt>
          <dd>{tenant.domain}</dd>
        </div>
        <div>
          <dt className="text-muted">Status</dt>
          <dd>{tenant.status ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Website</dt>
          <dd>
            {tenant.website ? (
              <a
                href={tenant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mint hover:underline break-all"
              >
                {tenant.website}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        {tenant.logoUrl && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Logo</dt>
            <dd>
              <Image
                src={tenant.logoUrl}
                alt={`${tenant.name} logo`}
                width={120}
                height={60}
                className="h-12 w-auto object-contain"
                unoptimized
              />
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted">Primary contact name</dt>
          <dd>{tenant.primaryContactName || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Primary contact email</dt>
          <dd>{tenant.primaryContactEmail || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Primary contact phone</dt>
          <dd>{tenant.primaryContactPhone || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Address</dt>
          <dd>{addressLine}</dd>
        </div>
        <div>
          <dt className="text-muted">City</dt>
          <dd>{tenant.city || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">State</dt>
          <dd>{tenant.state || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Country</dt>
          <dd>{tenant.country || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Zip code</dt>
          <dd>{tenant.zipCode || "—"}</dd>
        </div>
        {tenant.deletedAt != null && tenant.deletedAt !== "" && (
          <div>
            <dt className="text-muted">Deleted at</dt>
            <dd className="text-muted">{tenant.deletedAt}</dd>
          </div>
        )}
        {tenant.createdAt != null && tenant.createdAt !== "" && (
          <div>
            <dt className="text-muted">Created at</dt>
            <dd className="text-muted">{tenant.createdAt}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
