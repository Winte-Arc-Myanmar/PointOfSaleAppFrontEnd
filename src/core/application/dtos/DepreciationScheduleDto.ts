export interface DepreciationScheduleDto {
  id?: string;
  assetId?: string;
  scheduledDate: string;
  depreciationAmount: string;
  isPosted: boolean;
  postedJournalEntryId?: string | null;
}
