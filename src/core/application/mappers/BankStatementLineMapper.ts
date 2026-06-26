import type { BankStatementLine } from "@/core/domain/entities/BankStatementLine";
import type { BankStatementLineDto } from "../dtos/BankStatementLineDto";

export function toBankStatementLine(
  bankStatementId: string,
  dto: BankStatementLineDto & { id: string }
): BankStatementLine {
  return {
    id: dto.id,
    statementId: dto.statementId ?? bankStatementId,
    transactionDate: dto.transactionDate ?? "",
    description: dto.description ?? "",
    referenceNumber: dto.referenceNumber ?? "",
    amount: dto.amount ?? "0.0000",
    status: dto.status ?? "UNMATCHED",
  };
}

export function toBankStatementLineDto(
  line: Partial<BankStatementLine>
): BankStatementLineDto {
  return {
    ...(line.id && { id: String(line.id) }),
    transactionDate: line.transactionDate ?? "",
    description: line.description ?? "",
    referenceNumber: line.referenceNumber ?? "",
    amount: line.amount ?? "0.0000",
    status: line.status ?? "UNMATCHED",
  };
}
