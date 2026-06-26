import type { Id } from "@/core/domain/types";

export interface BankStatement {
  id: Id;
  tenantId: string;
  glAccountId: string;
  statementDate: string;
  openingBalance: string;
  closingBalance: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
