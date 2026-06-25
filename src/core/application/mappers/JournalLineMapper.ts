import type { JournalLine } from "@/core/domain/entities/JournalLine";
import type { JournalLineDto } from "../dtos/JournalLineDto";

export function toJournalLine(
  journalEntryId: string,
  dto: JournalLineDto & { id: string }
): JournalLine {
  return {
    id: dto.id,
    journalEntryId: dto.journalEntryId ?? journalEntryId,
    accountId: dto.accountId ?? "",
    transactionCurrency: dto.transactionCurrency ?? "",
    transactionDebit: dto.transactionDebit ?? "0.0000",
    transactionCredit: dto.transactionCredit ?? "0.0000",
    exchangeRate: dto.exchangeRate ?? "1.0000",
    baseDebit: dto.baseDebit ?? "0.0000",
    baseCredit: dto.baseCredit ?? "0.0000",
  };
}

export function toJournalLineDto(line: Partial<JournalLine>): JournalLineDto {
  return {
    ...(line.id && { id: String(line.id) }),
    accountId: line.accountId ?? "",
    transactionCurrency: line.transactionCurrency ?? "",
    transactionDebit: line.transactionDebit ?? "0.0000",
    transactionCredit: line.transactionCredit ?? "0.0000",
    exchangeRate: line.exchangeRate ?? "1.0000",
    baseDebit: line.baseDebit ?? "0.0000",
    baseCredit: line.baseCredit ?? "0.0000",
  };
}
