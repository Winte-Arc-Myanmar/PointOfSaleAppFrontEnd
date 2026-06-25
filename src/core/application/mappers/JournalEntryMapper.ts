import type { JournalEntry } from "@/core/domain/entities/JournalEntry";
import type { JournalEntryDto } from "../dtos/JournalEntryDto";

export function toJournalEntry(
  dto: JournalEntryDto & { id: string }
): JournalEntry {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    periodId: dto.periodId ?? "",
    entryDate: dto.entryDate ?? null,
    description: dto.description ?? "",
    sourceModule: dto.sourceModule ?? "",
    sourceRecordId: dto.sourceRecordId ?? "",
    status: dto.status ?? "DRAFT",
    postedAt: dto.postedAt ?? null,
    postedBy: dto.postedBy ?? "",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toJournalEntryDto(entry: Partial<JournalEntry>): JournalEntryDto {
  return {
    ...(entry.id && { id: String(entry.id) }),
    tenantId: entry.tenantId ?? "",
    periodId: entry.periodId ?? "",
    description: entry.description ?? "",
    sourceModule: entry.sourceModule ?? "",
    sourceRecordId: entry.sourceRecordId ?? "",
    status: entry.status ?? "DRAFT",
    postedBy: entry.postedBy ?? "",
  };
}
