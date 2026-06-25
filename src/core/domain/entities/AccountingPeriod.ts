import type { Id } from "@/core/domain/types";

export type AccountingPeriodStatus = "OPEN" | "CLOSED" | string;

export interface AccountingPeriod {
  id: Id;
  tenantId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: AccountingPeriodStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
