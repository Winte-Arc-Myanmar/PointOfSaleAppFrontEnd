"use client";

import Link from "next/link";
import Image from "next/image";
import { useTenant } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { Building2, User, MapPin, Info } from "lucide-react";
import {
  DetailSection,
  DetailRows,
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
  const overviewRows = tenant
    ? [
        { label: "Tenant ID", value: safeText(tenant.id), mono: true },
        { label: "Name", value: safeText(tenant.name) },
        { label: "Legal name", value: safeText(tenant.legalName) },
        { label: "Domain", value: safeText(tenant.domain), mono: true },
        { label: "Status", value: safeText(tenant.status) },
        {
          label: "Website",
          value: tenant.website ? (
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
          ),
        },
      ]
    : [];
  const contactRows = tenant
    ? [
        { label: "Name", value: safeText(tenant.primaryContactName) },
        { label: "Email", value: safeText(tenant.primaryContactEmail) },
        { label: "Phone", value: safeText(tenant.primaryContactPhone) },
      ]
    : [];
  const recordRows = tenant
    ? [
        { label: "Created at", value: formatDate(tenant.createdAt) },
        ...(tenant.deletedAt ? [{ label: "Deleted at", value: formatDate(tenant.deletedAt) }] : []),
      ]
    : [];

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
            <DetailRows rows={overviewRows} />
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
          <DetailRows rows={contactRows} />
        </DetailSection>

        <DetailSection title="Address" icon={MapPin} className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            <div className="space-y-0 sm:col-span-2">
              <DetailRows rows={[{ label: "Full address", value: addressLine }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "City", value: safeText(tenant.city) }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "State", value: safeText(tenant.state) }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "Country", value: safeText(tenant.country) }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "Zip code", value: safeText(tenant.zipCode) }]} />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
