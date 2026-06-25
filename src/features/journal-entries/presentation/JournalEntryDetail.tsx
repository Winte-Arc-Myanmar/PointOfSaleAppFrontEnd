"use client";

import Link from "next/link";
import { BookOpen, Info, ListTree } from "lucide-react";
import { useJournalEntry } from "@/presentation/hooks/useJournalEntries";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function JournalEntryDetail({ journalEntryId }: { journalEntryId: string }) {
  const { data: entry, isLoading, error } = useJournalEntry(journalEntryId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading journal entry..." />;
  if (error || !entry) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Journal entry not found or failed to load.</p>
        <Link href="/journal-entries">
          <Button variant="outline">Back to Journal Entries</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Entry ID", value: safeText(entry.id), mono: true },
    { label: "Tenant ID", value: safeText(entry.tenantId), mono: true },
    { label: "Period ID", value: safeText(entry.periodId), mono: true },
    { label: "Description", value: safeText(entry.description) },
    { label: "Entry date", value: formatDate(entry.entryDate ?? undefined) },
    { label: "Source module", value: safeText(entry.sourceModule) },
    { label: "Source record ID", value: safeText(entry.sourceRecordId), mono: true },
    { label: "Status", value: safeText(entry.status) },
    { label: "Posted at", value: formatDate(entry.postedAt ?? undefined) },
    { label: "Posted by", value: safeText(entry.postedBy), mono: true },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(entry.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(entry.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/journal-entries"
        backLabel="Journal Entries"
        title={safeText(entry.description)}
        editHref={`/journal-entries/${entry.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link href={`/journal-lines/${entry.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ListTree className="h-4 w-4" />
            View journal lines
          </Button>
        </Link>
      </div>

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
