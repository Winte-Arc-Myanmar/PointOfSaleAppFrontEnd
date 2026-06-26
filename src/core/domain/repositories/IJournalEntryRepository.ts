import type { JournalEntry } from "../entities/JournalEntry";
import type { JournalEntryDto } from "@/core/application/dtos/JournalEntryDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetJournalEntriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type JournalEntryWriteDto = Omit<
  JournalEntryDto,
  "id" | "entryDate" | "postedAt" | "createdAt" | "updatedAt"
>;

export interface IJournalEntryRepository {
  getAll(params?: GetJournalEntriesParams): Promise<PaginatedResult<JournalEntry>>;
  getById(id: string): Promise<JournalEntry | null>;
  create(data: JournalEntryWriteDto): Promise<JournalEntry>;
  update(id: string, data: JournalEntryWriteDto): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
