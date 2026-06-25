import type { AccountingPeriodStatus } from "@/core/domain/entities/AccountingPeriod";

export interface AccountingPeriodDto {
  id?: string;
  tenantId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: AccountingPeriodStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
