"use client";

import Link from "next/link";
import { CalendarRange, Info } from "lucide-react";
import { useAccountingPeriod } from "@/presentation/hooks/useAccountingPeriods";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function AccountingPeriodDetail({ accountingPeriodId }: { accountingPeriodId: string }) {
  const { data: period, isLoading, error } = useAccountingPeriod(accountingPeriodId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading accounting period..." />;
  if (error || !period) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Accounting period not found or failed to load.</p>
        <Link href="/accounting-periods">
          <Button variant="outline">Back to Accounting Periods</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Period ID", value: safeText(period.id), mono: true },
    { label: "Tenant ID", value: safeText(period.tenantId), mono: true },
    { label: "Period name", value: safeText(period.periodName) },
    { label: "Start date", value: formatDate(period.startDate) },
    { label: "End date", value: formatDate(period.endDate) },
    { label: "Status", value: safeText(period.status) },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(period.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(period.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/accounting-periods"
        backLabel="Accounting Periods"
        title={safeText(period.periodName)}
        editHref={`/accounting-periods/${period.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={CalendarRange}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
