import type { AccountingPeriod } from "@/core/domain/entities/AccountingPeriod";
import type { AccountingPeriodDto } from "../dtos/AccountingPeriodDto";

export function toAccountingPeriod(
  dto: AccountingPeriodDto & { id: string }
): AccountingPeriod {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    periodName: dto.periodName ?? "",
    startDate: dto.startDate ?? "",
    endDate: dto.endDate ?? "",
    status: dto.status ?? "OPEN",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toAccountingPeriodDto(
  period: Partial<AccountingPeriod>
): AccountingPeriodDto {
  return {
    ...(period.id && { id: String(period.id) }),
    tenantId: period.tenantId ?? "",
    periodName: period.periodName ?? "",
    startDate: period.startDate ?? "",
    endDate: period.endDate ?? "",
    status: period.status ?? "OPEN",
  };
}
