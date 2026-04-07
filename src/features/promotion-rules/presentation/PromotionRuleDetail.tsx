"use client";

import Link from "next/link";
import { Tag, Info, Calendar } from "lucide-react";
import { usePromotionRule } from "@/presentation/hooks/usePromotionRules";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function PromotionRuleDetail({ ruleId }: { ruleId: string }) {
  const { data: rule, isLoading, error } = usePromotionRule(ruleId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading rule..." />;
  if (error || !rule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Promotion rule not found or failed to load.</p>
        <Link href="/promotion-rules">
          <Button variant="outline">Back to Promotion Rules</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Rule ID", value: safeText(rule.id), mono: true },
    { label: "Name", value: safeText(rule.name) },
    { label: "Tenant ID", value: safeText(rule.tenantId), mono: true },
    { label: "Priority", value: String(rule.priorityLevel ?? 0) },
    { label: "Stackable", value: rule.isStackable ? "Yes" : "No" },
  ];

  const rewardRows = [
    { label: "Type", value: safeText(rule.rewardAction?.type) },
    { label: "Value", value: String(rule.rewardAction?.value ?? 0) },
  ];

  const datesRows = [
    { label: "Start date", value: formatDate(rule.startDate) },
    { label: "End date", value: formatDate(rule.endDate) },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(rule.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(rule.updatedAt ?? undefined) },
    ...(rule.deletedAt ? [{ label: "Deleted at", value: formatDate(rule.deletedAt) }] : []),
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/promotion-rules"
        backLabel="Promotion rules"
        title={safeText(rule.name)}
        editHref={`/promotion-rules/${rule.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Tag}>
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Reward" icon={Tag}>
          <DetailRows rows={rewardRows} />
        </DetailSection>

        <DetailSection title="Dates" icon={Calendar}>
          <DetailRows rows={datesRows} />
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>

        <DetailSection title="Eligibility criteria" icon={Tag} className="lg:col-span-2">
          <pre className="text-xs font-mono text-foreground overflow-auto rounded bg-muted/50 p-3">
            {JSON.stringify(rule.eligibilityCriteria ?? {}, null, 2)}
          </pre>
        </DetailSection>
      </div>
    </div>
  );
}

