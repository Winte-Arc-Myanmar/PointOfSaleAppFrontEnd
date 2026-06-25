"use client";

import Link from "next/link";
import { Shell } from "@/presentation/components/layout/Shell";
import { Button } from "@/presentation/components/ui/button";
import { useJournalEntry } from "@/presentation/hooks/useJournalEntries";
import { JournalLineList } from "./JournalLineList";

export function JournalLinesListShell({ journalEntryId }: { journalEntryId: string }) {
  const { data: entry } = useJournalEntry(journalEntryId);
  const entryLabel = entry?.description?.trim() || journalEntryId;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/journal-lines">
            <Button variant="outline" size="sm">
              All entries
            </Button>
          </Link>
          <Link href={`/journal-entries/${journalEntryId}`}>
            <Button variant="outline" size="sm">
              Journal entry
            </Button>
          </Link>
          <p className="page-description mb-0">
            Lines for: <span className="font-semibold text-foreground">{entryLabel}</span>
          </p>
        </div>
        <section>
          <h2 className="section-label mb-4">Journal lines</h2>
          <JournalLineList journalEntryId={journalEntryId} />
        </section>
      </div>
    </Shell>
  );
}
