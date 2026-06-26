export interface BankStatementDto {
  id?: string;
  tenantId: string;
  glAccountId: string;
  statementDate: string;
  openingBalance: string;
  closingBalance: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
