"use client";

import Link from "next/link";
import { useBranch } from "@/presentation/hooks/useBranches";
import { Button } from "@/presentation/components/ui/button";
import { MapPin, Phone, Building2, Clock, Info } from "lucide-react";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function BranchDetail({ branchId }: { branchId: string }) {
  const { data: branch, isLoading, error } = useBranch(branchId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading branch..." />;
  if (error || !branch)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Branch not found or failed to load.</p>
        <Link href="/admin/branches">
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

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/admin/branches"
        backLabel="Branches"
        title={safeText(branch.name)}
        editHref={`/admin/branches/${branch.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Building2}>
          <div className="space-y-0">
            <DetailRow label="Branch ID" value={safeText(branch.id)} mono />
            <DetailRow label="Name" value={safeText(branch.name)} />
            <DetailRow label="Branch code" value={safeText(branch.branchCode)} mono />
            <DetailRow label="Type" value={safeText(branch.type)} />
            <DetailRow label="Status" value={safeText(branch.status)} />
            <DetailRow label="Tenant ID" value={safeText(branch.tenantId)} mono />
            {branch.managerId != null && branch.managerId !== "" && (
              <DetailRow label="Manager ID" value={safeText(branch.managerId)} mono />
            )}
          </div>
        </DetailSection>

        <DetailSection title="Contact" icon={Phone}>
          <div className="space-y-0">
            <DetailRow
              label="Phone"
              value={
                typeof branch.phone === "string" && branch.phone ? (
                  <a href={`tel:${branch.phone}`} className="text-mint hover:underline">
                    {branch.phone}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              label="Email"
              value={
                typeof branch.email === "string" && branch.email ? (
                  <a href={`mailto:${branch.email}`} className="text-mint hover:underline">
                    {branch.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </DetailSection>

        <DetailSection title="Address" icon={MapPin} className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            <div className="space-y-0 sm:col-span-2">
              <DetailRow label="Full address" value={addressLine} />
            </div>
            <div className="space-y-0">
              <DetailRow label="City" value={safeText(branch.city)} />
            </div>
            <div className="space-y-0">
              <DetailRow label="State" value={safeText(branch.state)} />
            </div>
            <div className="space-y-0">
              <DetailRow label="Country" value={safeText(branch.country)} />
            </div>
            <div className="space-y-0">
              <DetailRow label="Zip code" value={safeText(branch.zipCode)} />
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Location & hours" icon={Clock}>
          <div className="space-y-0">
            {branch.latitude != null && (
              <DetailRow label="Latitude" value={branch.latitude} />
            )}
            {branch.longitude != null && (
              <DetailRow label="Longitude" value={branch.longitude} />
            )}
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
          <div className="space-y-0">
            <DetailRow label="Created at" value={formatDate(branch.createdAt)} />
            <DetailRow label="Updated at" value={formatDate(branch.updatedAt)} />
            {branch.deletedAt != null && branch.deletedAt !== "" && (
              <DetailRow label="Deleted at" value={formatDate(branch.deletedAt)} />
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
