import type { IJournalEntryService } from "@/core/domain/services/IJournalEntryService";
import type { IJournalEntryRepository } from "@/core/domain/repositories/IJournalEntryRepository";
import type { JournalEntry } from "@/core/domain/entities/JournalEntry";
import type {
  GetJournalEntriesParams,
  JournalEntryWriteDto,
} from "@/core/domain/repositories/IJournalEntryRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class JournalEntryService implements IJournalEntryService {
  constructor(private readonly journalEntryRepository: IJournalEntryRepository) {}

  getAll(params?: GetJournalEntriesParams): Promise<PaginatedResult<JournalEntry>> {
    return this.journalEntryRepository.getAll(params);
  }

  getById(id: string): Promise<JournalEntry | null> {
    return this.journalEntryRepository.getById(id);
  }

  create(data: JournalEntryWriteDto): Promise<JournalEntry> {
    return this.journalEntryRepository.create(data);
  }

  update(id: string, data: JournalEntryWriteDto): Promise<JournalEntry> {
    return this.journalEntryRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.journalEntryRepository.delete(id);
  }
}
