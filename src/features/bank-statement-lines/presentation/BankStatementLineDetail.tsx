"use client";

import Link from "next/link";
import { ListTree, Info } from "lucide-react";
import { useBankStatementLine } from "@/presentation/hooks/useBankStatementLines";
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

export function BankStatementLineDetail({
  bankStatementId,
  lineId,
}: {
  bankStatementId: string;
  lineId: string;
}) {
  const { data: line, isLoading, error } = useBankStatementLine(bankStatementId, lineId);
  const { data: statement } = useBankStatement(bankStatementId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading line..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Bank statement line not found or failed to load.</p>
        <Link href={`/bank-statement-lines/${bankStatementId}`}>
          <Button variant="outline">Back to Bank Statement Lines</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Line ID", value: safeText(line.id), mono: true },
    { label: "Statement ID", value: safeText(line.statementId), mono: true },
    { label: "Transaction date", value: formatDate(line.transactionDate) },
    { label: "Description", value: safeText(line.description) },
    { label: "Reference number", value: safeText(line.referenceNumber) },
    { label: "Amount", value: safeText(line.amount), mono: true },
    { label: "Status", value: safeText(line.status) },
  ];

  const contextRows = statement
    ? [
        { label: "Statement date", value: formatDate(statement.statementDate) },
        { label: "Opening balance", value: safeText(statement.openingBalance), mono: true },
        { label: "Closing balance", value: safeText(statement.closingBalance), mono: true },
      ]
    : [];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={`/bank-statement-lines/${bankStatementId}`}
        backLabel="Bank Statement Lines"
        title={safeText(line.description)}
        editHref={`/bank-statement-lines/${bankStatementId}/${line.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Line details" icon={ListTree}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        {contextRows.length > 0 && (
          <DetailSection title="Bank statement" icon={Info}>
            <DetailRows rows={contextRows} />
          </DetailSection>
        )}
      </div>
    </div>
  );
}
