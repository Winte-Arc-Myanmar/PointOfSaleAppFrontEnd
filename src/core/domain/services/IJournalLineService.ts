import type { JournalLine } from "../entities/JournalLine";
import type {
  GetJournalLinesParams,
  JournalLineWriteDto,
} from "../repositories/IJournalLineRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IJournalLineService {
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
