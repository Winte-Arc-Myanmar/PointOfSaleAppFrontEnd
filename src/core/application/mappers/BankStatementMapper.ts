import type { BankStatement } from "@/core/domain/entities/BankStatement";
import type { BankStatementDto } from "../dtos/BankStatementDto";

export function toBankStatement(
  dto: BankStatementDto & { id: string }
): BankStatement {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    glAccountId: dto.glAccountId ?? "",
    statementDate: dto.statementDate ?? "",
    openingBalance: dto.openingBalance ?? "0.0000",
    closingBalance: dto.closingBalance ?? "0.0000",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toBankStatementDto(
  statement: Partial<BankStatement>
): BankStatementDto {
  return {
    ...(statement.id && { id: String(statement.id) }),
    tenantId: statement.tenantId ?? "",
    glAccountId: statement.glAccountId ?? "",
    statementDate: statement.statementDate ?? "",
    openingBalance: statement.openingBalance ?? "0.0000",
    closingBalance: statement.closingBalance ?? "0.0000",
  };
}
