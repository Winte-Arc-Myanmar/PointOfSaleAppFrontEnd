"use client";

import { useMemo, useState } from "react";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useJournalEntries } from "@/presentation/hooks/useJournalEntries";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { JournalLineList } from "./JournalLineList";

const ENTRY_LIST_LIMIT = 200;
const NONE_SELECTED = "";

export function JournalLinesPageWithEntrySelect() {
  const { data: entriesData, isLoading } = useJournalEntries({
    page: 1,
    limit: ENTRY_LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const entries = getPaginatedItems(entriesData);
  const [selectedId, setSelectedId] = useState<string>(NONE_SELECTED);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.description.localeCompare(b.description)),
    [entries]
  );

  return (
    <div className="space-y-6">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="journal-entry-select">Journal entry</Label>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={isLoading}>
          <SelectTrigger id="journal-entry-select">
            <SelectValue placeholder={isLoading ? "Loading entries..." : "Select journal entry"} />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.description} ({e.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId ? (
        <JournalLineList journalEntryId={selectedId} />
      ) : (
        <p className="text-sm text-muted">Select a journal entry to view and manage its lines.</p>
      )}
    </div>
  );
}
