import type { Id } from "@/core/domain/types";

export type JournalEntryStatus = "DRAFT" | "POSTED" | string;

export interface JournalEntry {
  id: Id;
  tenantId: string;
  periodId: string;
  entryDate?: string | null;
  description: string;
  sourceModule: string;
  sourceRecordId: string;
  status: JournalEntryStatus;
  postedAt?: string | null;
  postedBy: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
