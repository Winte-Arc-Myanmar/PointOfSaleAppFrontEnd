"use client";

import Link from "next/link";
import { ArrowLeftRight, Info } from "lucide-react";
import { useExchangeRate } from "@/presentation/hooks/useExchangeRates";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function ExchangeRateDetail({ exchangeRateId }: { exchangeRateId: string }) {
  const { data: rate, isLoading, error } = useExchangeRate(exchangeRateId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading exchange rate..." />;
  if (error || !rate) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Exchange rate not found or failed to load.</p>
        <Link href="/exchange-rates">
          <Button variant="outline">Back to Exchange Rates</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Rate ID", value: safeText(rate.id), mono: true },
    { label: "Tenant ID", value: safeText(rate.tenantId), mono: true },
    { label: "Base currency", value: safeText(rate.baseCurrency) },
    { label: "Target currency", value: safeText(rate.targetCurrency) },
    { label: "Rate", value: safeText(rate.rate), mono: true },
    { label: "Effective from", value: formatDate(rate.effectiveFrom) },
    { label: "Effective to", value: formatDate(rate.effectiveTo) },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(rate.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(rate.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/exchange-rates"
        backLabel="Exchange Rates"
        title={`${safeText(rate.baseCurrency)} / ${safeText(rate.targetCurrency)}`}
        editHref={`/exchange-rates/${rate.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ArrowLeftRight}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
