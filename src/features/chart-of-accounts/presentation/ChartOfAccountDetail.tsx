"use client";

import Link from "next/link";
import { BookOpen, Info } from "lucide-react";
import { useChartOfAccount } from "@/presentation/hooks/useChartOfAccounts";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function ChartOfAccountDetail({ chartOfAccountId }: { chartOfAccountId: string }) {
  const { data: account, isLoading, error } = useChartOfAccount(chartOfAccountId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading chart account..." />;
  if (error || !account) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Chart account not found or failed to load.</p>
        <Link href="/chart-of-accounts">
          <Button variant="outline">Back to Chart of Accounts</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Account ID", value: safeText(account.id), mono: true },
    { label: "Tenant ID", value: safeText(account.tenantId), mono: true },
    { label: "Parent account ID", value: safeText(account.parentAccountId), mono: true },
    { label: "Account code", value: safeText(account.accountCode), mono: true },
    { label: "Account name", value: safeText(account.accountName) },
    { label: "Account type", value: safeText(account.accountType) },
    { label: "Reconcilable", value: account.isReconcilable ? "Yes" : "No" },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(account.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(account.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/chart-of-accounts"
        backLabel="Chart of Accounts"
        title={`${safeText(account.accountCode)} - ${safeText(account.accountName)}`}
        editHref={`/chart-of-accounts/${account.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={BookOpen}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}

