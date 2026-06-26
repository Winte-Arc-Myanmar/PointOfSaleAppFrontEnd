"use client";

import Link from "next/link";
import { Landmark, Info, ListTree } from "lucide-react";
import { useBankStatement } from "@/presentation/hooks/useBankStatements";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function BankStatementDetail({ bankStatementId }: { bankStatementId: string }) {
  const { data: statement, isLoading, error } = useBankStatement(bankStatementId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading bank statement..." />;
  if (error || !statement) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Bank statement not found or failed to load.</p>
        <Link href="/bank-statements">
          <Button variant="outline">Back to Bank Statements</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Statement ID", value: safeText(statement.id), mono: true },
    { label: "Tenant ID", value: safeText(statement.tenantId), mono: true },
    { label: "GL account ID", value: safeText(statement.glAccountId), mono: true },
    { label: "Statement date", value: formatDate(statement.statementDate) },
    { label: "Opening balance", value: safeText(statement.openingBalance), mono: true },
    { label: "Closing balance", value: safeText(statement.closingBalance), mono: true },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(statement.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(statement.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/bank-statements"
        backLabel="Bank Statements"
        title={`Statement ${formatDate(statement.statementDate)}`}
        editHref={`/bank-statements/${statement.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link href={`/bank-statement-lines/${statement.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ListTree className="h-4 w-4" />
            View statement lines
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Landmark}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}
