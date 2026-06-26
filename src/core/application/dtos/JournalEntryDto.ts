import type { JournalEntryStatus } from "@/core/domain/entities/JournalEntry";

export interface JournalEntryDto {
  id?: string;
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
