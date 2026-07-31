"use client";

import Link from "next/link";
import { useBranch } from "@/presentation/hooks/useBranches";
import { useTenant } from "@/presentation/hooks/useTenants";
import { useUsers } from "@/presentation/hooks/useUsers";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { Button } from "@/presentation/components/ui/button";
import { MapPin, Phone, Building2, Clock, Info, Users } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function BranchDetail({ branchId }: { branchId: string }) {
  const { data: branch, isLoading, error } = useBranch(branchId);
  const { data: tenant } = useTenant(branch?.tenantId ?? null);
  const { data: usersData } = useUsers({ page: 1, limit: 200 });
  const branchUsers = getPaginatedItems(usersData).filter(
    (user) => String(user.branchId) === String(branchId),
  );

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading branch..." />;
  if (error || !branch)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Branch not found or failed to load.</p>
        <Link href="/branches">
          <Button variant="outline">Back to Branches</Button>
        </Link>
      </div>
    );

  const addressParts = [
    safeText(branch.address),
    safeText(branch.city),
    safeText(branch.state),
    safeText(branch.zipCode),
    safeText(branch.country),
  ].filter((s) => s && s !== "—");
  const addressLine = addressParts.length > 0 ? addressParts.join(", ") : "—";
  const overviewRows = branch
    ? [
        { label: "Branch ID", value: safeText(branch.id), mono: true },
        { label: "Name", value: safeText(branch.name) },
        { label: "Branch code", value: safeText(branch.branchCode), mono: true },
        { label: "Type", value: safeText(branch.type) },
        { label: "Status", value: safeText(branch.status) },
        ...(branch.managerId ? [{ label: "Manager ID", value: safeText(branch.managerId), mono: true }] : []),
      ]
    : [];
  const contactRows = branch
    ? [
        {
          label: "Phone",
          value:
            typeof branch.phone === "string" && branch.phone ? (
              <a href={`tel:${branch.phone}`} className="text-mint hover:underline">
                {branch.phone}
              </a>
            ) : (
              "—"
            ),
        },
        {
          label: "Email",
          value:
            typeof branch.email === "string" && branch.email ? (
              <a href={`mailto:${branch.email}`} className="text-mint hover:underline">
                {branch.email}
              </a>
            ) : (
              "—"
            ),
        },
      ]
    : [];
  const locationRows = branch
    ? [
        ...(branch.latitude != null ? [{ label: "Latitude", value: branch.latitude }] : []),
        ...(branch.longitude != null ? [{ label: "Longitude", value: branch.longitude }] : []),
      ]
    : [];
  const recordRows = branch
    ? [
        { label: "Created at", value: formatDate(branch.createdAt) },
        { label: "Updated at", value: formatDate(branch.updatedAt) },
        ...(branch.deletedAt ? [{ label: "Deleted at", value: formatDate(branch.deletedAt) }] : []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/branches"
        backLabel="Branches"
        title={safeText(branch.name)}
        editHref={`/branches/${branch.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Building2}>
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Contact" icon={Phone}>
          <DetailRows rows={contactRows} />
        </DetailSection>

        <DetailSection title="Tenant" icon={Building2}>
          {tenant ? (
            <DetailRows
              rows={[
                {
                  label: "Tenant",
                  value: (
                    <Link href={`/tenants/${tenant.id}`} className="font-medium text-mint hover:underline">
                      {tenant.name}
                    </Link>
                  ),
                },
                { label: "Legal name", value: safeText(tenant.legalName) },
                { label: "Contact", value: safeText(tenant.primaryContactName) },
                { label: "Email", value: safeText(tenant.primaryContactEmail) },
              ]}
            />
          ) : (
            <p className="text-sm text-muted">Tenant details are unavailable.</p>
          )}
        </DetailSection>

        <DetailSection title="Address" icon={MapPin} className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            <div className="space-y-0 sm:col-span-2">
              <DetailRows rows={[{ label: "Full address", value: addressLine }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "City", value: safeText(branch.city) }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "State", value: safeText(branch.state) }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "Country", value: safeText(branch.country) }]} />
            </div>
            <div className="space-y-0">
              <DetailRows rows={[{ label: "Zip code", value: safeText(branch.zipCode) }]} />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Location & hours" icon={Clock}>
          <div className="space-y-0">
            <DetailRows rows={locationRows} />
            {branch.latitude == null && branch.longitude == null && (
              <p className="text-sm text-muted py-2">No coordinates</p>
            )}
            {branch.openingHours != null &&
              typeof branch.openingHours === "object" &&
              Object.keys(branch.openingHours).length > 0 && (
                <div className="pt-2">
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider">Opening hours</dt>
                  <dd className="mt-1 text-sm">
                    <ul className="space-y-1">
                      {Object.entries(branch.openingHours).map(([day, hours]) => (
                        <li key={day} className="flex justify-between gap-4 font-mono text-xs">
                          <span className="capitalize text-muted">{day}</span>
                          <span className="text-foreground">{hours}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
          </div>
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>

        <DetailSection title={`Users (${branchUsers.length})`} icon={Users} className="lg:col-span-2">
          {branchUsers.length > 0 ? (
            <div className="divide-y divide-border rounded-lg border border-border">
              {branchUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/users/${user.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{user.fullName || user.username}</p>
                    <p className="truncate text-sm text-muted">{user.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-foreground">{user.jobTitle || "User"}</p>
                    <p className="text-xs text-muted">{user.status || "Unknown"}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No users are assigned to this branch.</p>
          )}
        </DetailSection>
      </div>
    </div>
  );
}
