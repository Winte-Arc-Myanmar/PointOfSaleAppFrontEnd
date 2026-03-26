"use client";

import Link from "next/link";
import Image from "next/image";
import { useTenant } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { Building2, Globe, User, MapPin, Info } from "lucide-react";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function TenantDetail({ tenantId }: { tenantId: string }) {
  const { data: tenant, isLoading, error } = useTenant(tenantId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading tenant..." />;
  if (error || !tenant)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tenant not found or failed to load.</p>
        <Link href="/tenants">
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
      <DetailPageHeader
        backHref="/tenants"
        backLabel="Tenants"
        title={safeText(tenant.name)}
        editHref={`/tenants/${tenant.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Building2}>
          <div className="space-y-0">
            <DetailRow label="Tenant ID" value={safeText(tenant.id)} mono />
            <DetailRow label="Name" value={safeText(tenant.name)} />
            <DetailRow label="Legal name" value={safeText(tenant.legalName)} />
            <DetailRow label="Domain" value={safeText(tenant.domain)} mono />
            <DetailRow label="Status" value={safeText(tenant.status)} />
            <DetailRow
              label="Website"
              value={
                tenant.website ? (
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
                )
              }
            />
            {tenant.logoUrl && (
              <div className="pt-2">
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Logo</dt>
                <dd className="mt-1">
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
          </div>
        </DetailSection>

        <DetailSection title="Primary contact" icon={User}>
          <div className="space-y-0">
            <DetailRow label="Name" value={safeText(tenant.primaryContactName)} />
            <DetailRow label="Email" value={safeText(tenant.primaryContactEmail)} />
            <DetailRow label="Phone" value={safeText(tenant.primaryContactPhone)} />
          </div>
        </DetailSection>

        <DetailSection title="Address" icon={MapPin} className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            <div className="space-y-0 sm:col-span-2">
              <DetailRow label="Full address" value={addressLine} />
            </div>
            <div className="space-y-0">
              <DetailRow label="City" value={safeText(tenant.city)} />
            </div>
            <div className="space-y-0">
              <DetailRow label="State" value={safeText(tenant.state)} />
            </div>
            <div className="space-y-0">
              <DetailRow label="Country" value={safeText(tenant.country)} />
            </div>
            <div className="space-y-0">
              <DetailRow label="Zip code" value={safeText(tenant.zipCode)} />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <div className="space-y-0">
            <DetailRow label="Created at" value={formatDate(tenant.createdAt)} />
            {tenant.deletedAt != null && tenant.deletedAt !== "" && (
              <DetailRow label="Deleted at" value={formatDate(tenant.deletedAt)} />
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
