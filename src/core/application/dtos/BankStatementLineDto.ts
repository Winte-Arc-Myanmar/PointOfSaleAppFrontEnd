import type { BankStatementLineStatus } from "@/core/domain/entities/BankStatementLine";

export interface BankStatementLineDto {
  id?: string;
  statementId?: string;
  transactionDate: string;
  description: string;
  referenceNumber: string;
  amount: string;
  status: BankStatementLineStatus;
}
