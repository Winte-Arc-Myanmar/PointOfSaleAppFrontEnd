import type { Id } from "@/core/domain/types";

export interface JournalLine {
  id: Id;
  journalEntryId: string;
  accountId: string;
  transactionCurrency: string;
  transactionDebit: string;
  transactionCredit: string;
  exchangeRate: string;
  baseDebit: string;
  baseCredit: string;
}
