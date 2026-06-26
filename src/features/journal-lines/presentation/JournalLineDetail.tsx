"use client";

import Link from "next/link";
import { ListTree, Info } from "lucide-react";
import { useJournalLine } from "@/presentation/hooks/useJournalLines";
import { useJournalEntry } from "@/presentation/hooks/useJournalEntries";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function JournalLineDetail({
  journalEntryId,
  lineId,
}: {
  journalEntryId: string;
  lineId: string;
}) {
  const { data: line, isLoading, error } = useJournalLine(journalEntryId, lineId);
  const { data: entry } = useJournalEntry(journalEntryId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading journal line..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Journal line not found or failed to load.</p>
        <Link href={`/journal-lines/${journalEntryId}`}>
          <Button variant="outline">Back to Journal Lines</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Line ID", value: safeText(line.id), mono: true },
    { label: "Journal entry ID", value: safeText(line.journalEntryId), mono: true },
    { label: "Account ID", value: safeText(line.accountId), mono: true },
    { label: "Transaction currency", value: safeText(line.transactionCurrency) },
    { label: "Transaction debit", value: safeText(line.transactionDebit), mono: true },
    { label: "Transaction credit", value: safeText(line.transactionCredit), mono: true },
    { label: "Exchange rate", value: safeText(line.exchangeRate), mono: true },
    { label: "Base debit", value: safeText(line.baseDebit), mono: true },
    { label: "Base credit", value: safeText(line.baseCredit), mono: true },
  ];

  const contextRows = entry
    ? [
        { label: "Entry description", value: safeText(entry.description) },
        { label: "Entry status", value: safeText(entry.status) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={`/journal-lines/${journalEntryId}`}
        backLabel="Journal Lines"
        title={`Line ${safeText(line.id)}`}
        editHref={`/journal-lines/${journalEntryId}/${line.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Line details" icon={ListTree}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        {contextRows.length > 0 && (
          <DetailSection title="Journal entry" icon={Info}>
            <DetailRows rows={contextRows} />
          </DetailSection>
        )}
      </div>
    </div>
  );
}
