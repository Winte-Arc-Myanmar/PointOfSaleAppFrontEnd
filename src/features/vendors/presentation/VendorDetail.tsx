"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { useVendor } from "@/presentation/hooks/useVendors";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  safeText,
} from "@/presentation/components/detail";

export function VendorDetail({ vendorId }: { vendorId: string }) {
  const { data: vendor, isLoading, error } = useVendor(vendorId);

  const overviewRows = vendor
    ? [
        { label: "Vendor ID", value: safeText(vendor.id), mono: true },
        { label: "Name", value: safeText(vendor.name) },
        { label: "Tenant ID", value: safeText(vendor.tenantId), mono: true },
      ]
    : [];

  if (isLoading)
    return <AppLoader fullScreen={false} size="md" message="Loading vendor..." />;

  if (error || !vendor)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Vendor not found or failed to load.</p>
        <Link href="/vendors">
          <Button variant="outline">Back to Vendors</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/vendors"
        backLabel="Vendors"
        title={safeText(vendor.name)}
        editHref={`/vendors/${vendor.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Truck}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
      </div>
    </div>
  );
}

