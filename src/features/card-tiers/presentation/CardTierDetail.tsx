"use client";

import Link from "next/link";
import { CreditCard, Info } from "lucide-react";
import { useCardTier } from "@/presentation/hooks/useCardTiers";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

const LIST_HREF = "/card-tiers";

export function CardTierDetail({ cardTierId }: { cardTierId: string }) {
  const { data: tier, isLoading, error } = useCardTier(cardTierId);
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading card tier..." />;
  }
  if (error || !tier) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Card tier not found or failed to load.</p>
        <Link href={LIST_HREF}>
          <Button variant="outline">Back to Card Tiers</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Card tier ID", value: safeText(tier.id), mono: true },
    { label: "Tenant ID", value: safeText(tier.tenantId), mono: true },
    { label: "Name", value: safeText(tier.name) },
    { label: "Rank", value: safeText(tier.rank) },
    { label: "Preload amount", value: formatPrice(tier.preloadAmount) },
    { label: "Preload funding", value: safeText(tier.preloadFunding) },
    {
      label: "Discount",
      value: `${(tier.discountBps / 100).toFixed(2)}% (${tier.discountBps} bps)`,
    },
    { label: "Postpaid", value: tier.isPostpaid ? "Yes" : "No" },
    { label: "Validity days", value: safeText(tier.validityDays) },
    { label: "Active", value: tier.isActive ? "Yes" : "No" },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(tier.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(tier.updatedAt ?? undefined) },
    { label: "Deleted at", value: formatDate(tier.deletedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={LIST_HREF}
        backLabel="Card Tiers"
        title={safeText(tier.name)}
        editHref={`${LIST_HREF}/${tier.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Card details" icon={CreditCard}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
