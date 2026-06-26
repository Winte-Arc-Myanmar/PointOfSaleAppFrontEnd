export interface JournalLineDto {
  id?: string;
  journalEntryId?: string;
  accountId: string;
  transactionCurrency: string;
  transactionDebit: string;
  transactionCredit: string;
  exchangeRate: string;
  baseDebit: string;
  baseCredit: string;
}
