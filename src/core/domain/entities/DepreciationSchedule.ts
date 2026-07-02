import type { Id } from "@/core/domain/types";

export interface DepreciationSchedule {
  id: Id;
  assetId: string;
  scheduledDate: string;
  depreciationAmount: string;
  isPosted: boolean;
  postedJournalEntryId?: string | null;
}
