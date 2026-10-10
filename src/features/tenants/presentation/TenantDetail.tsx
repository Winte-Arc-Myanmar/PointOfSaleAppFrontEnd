"use client";

import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media-url";
import { useState } from "react";
import { useTenant } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { ResetTenantDataDialog } from "./ResetTenantDataDialog";
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
  const { isSystemAdmin } = usePermissions();
  const [resetOpen, setResetOpen] = useState(false);

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
                  {/* A plain img: next/image throws on a stored path it can't parse, taking the page down. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveMediaUrl(tenant.logoUrl)}
                    alt={`${tenant.name} logo`}
                    className="h-12 w-auto object-contain"
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
      {isSystemAdmin ? (
        <section className="flex flex-col gap-3 rounded-xl border border-red-500/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
            <p className="text-sm text-muted">
              Delete this shop&apos;s sales, stock, menu or other data. The shop, users and settings stay.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 !border-red-600 !bg-red-600 !text-white hover:!bg-red-700"
            onClick={() => setResetOpen(true)}
          >
            Reset data
          </Button>
          <ResetTenantDataDialog
            tenantId={String(tenant.id)}
            isOpen={resetOpen}
            onClose={() => setResetOpen(false)}
          />
        </section>
      ) : null}
    </div>
  );
}
