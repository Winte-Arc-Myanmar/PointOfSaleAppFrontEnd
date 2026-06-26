import type { JournalLine } from "../entities/JournalLine";
import type { JournalLineDto } from "@/core/application/dtos/JournalLineDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetJournalLinesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type JournalLineWriteDto = Omit<JournalLineDto, "id" | "journalEntryId">;

export interface IJournalLineRepository {
  getAll(
    journalEntryId: string,
    params?: GetJournalLinesParams
  ): Promise<PaginatedResult<JournalLine>>;
  getById(journalEntryId: string, id: string): Promise<JournalLine | null>;
  create(journalEntryId: string, data: JournalLineWriteDto): Promise<JournalLine>;
  update(
    journalEntryId: string,
    id: string,
    data: JournalLineWriteDto
  ): Promise<JournalLine>;
  delete(journalEntryId: string, id: string): Promise<void>;
}
