import type { ChartOfAccount } from "@/core/domain/entities/ChartOfAccount";
import type { ChartOfAccountDto } from "../dtos/ChartOfAccountDto";

export function toChartOfAccount(
  dto: ChartOfAccountDto & { id: string }
): ChartOfAccount {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    parentAccountId: dto.parentAccountId ?? null,
    accountCode: dto.accountCode ?? "",
    accountName: dto.accountName ?? "",
    accountType: dto.accountType ?? "ASSET",
    isReconcilable: Boolean(dto.isReconcilable),
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toChartOfAccountDto(
  account: Partial<ChartOfAccount>
): ChartOfAccountDto {
  return {
    ...(account.id && { id: String(account.id) }),
    tenantId: account.tenantId ?? "",
    parentAccountId: account.parentAccountId ?? null,
    accountCode: account.accountCode ?? "",
    accountName: account.accountName ?? "",
    accountType: account.accountType ?? "ASSET",
    isReconcilable: Boolean(account.isReconcilable),
  };
}

