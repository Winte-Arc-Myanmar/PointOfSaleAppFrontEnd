"use client";

import Link from "next/link";
import { BadgePercent, Info } from "lucide-react";
import { useTaxRate } from "@/presentation/hooks/useTaxRates";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function TaxRateDetail({ taxRateId }: { taxRateId: string }) {
  const { data: taxRate, isLoading, error } = useTaxRate(taxRateId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading tax rate..." />;
  if (error || !taxRate) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tax rate not found or failed to load.</p>
        <Link href="/tax-rates">
          <Button variant="outline">Back to Tax Rates</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Tax rate ID", value: safeText(taxRate.id), mono: true },
    { label: "Tenant ID", value: safeText(taxRate.tenantId), mono: true },
    { label: "Name", value: safeText(taxRate.name) },
    { label: "Rate percentage", value: `${safeText(taxRate.ratePercentage)}%` },
    { label: "Price inclusive", value: taxRate.isPriceInclusive ? "Yes" : "No" },
    {
      label: "GL liability account ID",
      value: safeText(taxRate.glLiabilityAccountId),
      mono: true,
    },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(taxRate.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(taxRate.updatedAt ?? undefined) },
    { label: "Deleted at", value: formatDate(taxRate.deletedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/tax-rates"
        backLabel="Tax Rates"
        title={safeText(taxRate.name)}
        editHref={`/tax-rates/${taxRate.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={BadgePercent}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
