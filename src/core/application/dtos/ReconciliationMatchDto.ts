export interface ReconciliationMatchDto {
  id?: string;
  statementLineId: string;
  journalLineId: string;
  matchedBy: string;
  matchedAt?: string | null;
}
