import type { Id } from "@/core/domain/types";

export type ChartOfAccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE";

export interface ChartOfAccount {
  id: Id;
  tenantId: string;
  parentAccountId: string | null;
  accountCode: string;
  accountName: string;
  accountType: ChartOfAccountType | string;
  isReconcilable: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

