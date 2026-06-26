import type { Id } from "@/core/domain/types";

export interface ReconciliationMatch {
  id: Id;
  statementLineId: string;
  journalLineId: string;
  matchedBy: string;
  matchedAt?: string | null;
}
