import type { Id } from "@/core/domain/types";

export type BankStatementLineStatus = "UNMATCHED" | "MATCHED" | string;

export interface BankStatementLine {
  id: Id;
  statementId: string;
  transactionDate: string;
  description: string;
  referenceNumber: string;
  amount: string;
  status: BankStatementLineStatus;
}
