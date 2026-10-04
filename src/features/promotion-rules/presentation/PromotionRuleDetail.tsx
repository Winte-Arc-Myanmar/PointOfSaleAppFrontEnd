"use client";

import Link from "next/link";
import { Calendar, Info, Tag } from "lucide-react";
import { usePromotionRule } from "@/presentation/hooks/usePromotionRules";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import {
  datesLabel,
  daysLabel,
  discountLabel,
  hoursLabel,
  POS_LABEL,
  scopeLabel,
  STATUS_LABEL,
  statusOf,
} from "./promotion-text";

export function PromotionRuleDetail({ ruleId }: { ruleId: string }) {
  const { data: rule, isLoading, error } = usePromotionRule(ruleId);
  const { formatPrice } = useCurrency();
  const { data: categoriesData } = useCategories({ page: 1, limit: 500 });
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading..." />;
  if (error || !rule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Promotion not found.</p>
        <Link href="/promotion-rules">
          <Button variant="outline">Back to promotions</Button>
        </Link>
      </div>
    );
  }

  const categoryNames = new Map(getPaginatedItems(categoriesData).map((c) => [String(c.id), c.name]));
  const locationNames = new Map(getPaginatedItems(locationsData).map((l) => [String(l.id), l.name]));

  const whatRows = [
    { label: "Discount", value: discountLabel(rule, formatPrice) },
    {
      label: "Applies to",
      value: scopeLabel(rule, (id) => categoryNames.get(id) ?? "Unknown category"),
    },
    {
      label: "POS",
      value: rule.posTypes.length ? rule.posTypes.map((p) => POS_LABEL[p]).join(", ") : "Every POS",
    },
    {
      label: "Outlets",
      value: rule.locationIds.length
        ? rule.locationIds.map((id) => locationNames.get(id) ?? "Unknown outlet").join(", ")
        : "Every outlet",
    },
  ];

  const whenRows = [
    { label: "Status", value: STATUS_LABEL[statusOf(rule)] },
    { label: "Dates", value: datesLabel(rule) ?? "No end date" },
    { label: "Days", value: daysLabel(rule.daysOfWeek) },
    { label: "Hours", value: hoursLabel(rule) },
    { label: "Priority", value: String(rule.priorityLevel) },
  ];

  const recordRows = [
    { label: "Created", value: formatDate(rule.createdAt ?? undefined) },
    { label: "Updated", value: formatDate(rule.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/promotion-rules"
        backLabel="Promotions"
        title={safeText(rule.name)}
        editHref={`/promotion-rules/${rule.id}/edit`}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DetailSection title="What it takes off" icon={Tag}>
          <DetailRows rows={whatRows} />
        </DetailSection>
        <DetailSection title="When it runs" icon={Calendar}>
          <DetailRows rows={whenRows} />
        </DetailSection>
        <DetailSection title="Record" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
