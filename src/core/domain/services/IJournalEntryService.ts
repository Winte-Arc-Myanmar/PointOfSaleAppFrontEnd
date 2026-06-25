import type { JournalEntry } from "../entities/JournalEntry";
import type {
  GetJournalEntriesParams,
  JournalEntryWriteDto,
} from "../repositories/IJournalEntryRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IJournalEntryService {
  getAll(params?: GetJournalEntriesParams): Promise<PaginatedResult<JournalEntry>>;
  getById(id: string): Promise<JournalEntry | null>;
  create(data: JournalEntryWriteDto): Promise<JournalEntry>;
  update(id: string, data: JournalEntryWriteDto): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
