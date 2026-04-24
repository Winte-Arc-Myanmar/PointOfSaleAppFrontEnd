import type { ChartOfAccountType } from "@/core/domain/entities/ChartOfAccount";

export interface ChartOfAccountDto {
  id?: string;
  tenantId: string;
  parentAccountId?: string | null;
  accountCode: string;
  accountName: string;
  accountType: ChartOfAccountType | string;
  isReconcilable: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

