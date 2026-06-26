import type { IJournalLineService } from "@/core/domain/services/IJournalLineService";
import type { IJournalLineRepository } from "@/core/domain/repositories/IJournalLineRepository";
import type { JournalLine } from "@/core/domain/entities/JournalLine";
import type {
  GetJournalLinesParams,
  JournalLineWriteDto,
} from "@/core/domain/repositories/IJournalLineRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class JournalLineService implements IJournalLineService {
  constructor(private readonly journalLineRepository: IJournalLineRepository) {}

  getAll(
    journalEntryId: string,
    params?: GetJournalLinesParams
  ): Promise<PaginatedResult<JournalLine>> {
    return this.journalLineRepository.getAll(journalEntryId, params);
  }

  getById(journalEntryId: string, id: string): Promise<JournalLine | null> {
    return this.journalLineRepository.getById(journalEntryId, id);
  }

  create(journalEntryId: string, data: JournalLineWriteDto): Promise<JournalLine> {
    return this.journalLineRepository.create(journalEntryId, data);
  }

  update(
    journalEntryId: string,
    id: string,
    data: JournalLineWriteDto
  ): Promise<JournalLine> {
    return this.journalLineRepository.update(journalEntryId, id, data);
  }

  delete(journalEntryId: string, id: string): Promise<void> {
    return this.journalLineRepository.delete(journalEntryId, id);
  }
}
