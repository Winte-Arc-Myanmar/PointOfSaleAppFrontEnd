import type {
  IJournalEntryRepository,
  GetJournalEntriesParams,
  JournalEntryWriteDto,
} from "@/core/domain/repositories/IJournalEntryRepository";
import type { JournalEntry } from "@/core/domain/entities/JournalEntry";
import type { JournalEntryDto } from "@/core/application/dtos/JournalEntryDto";
import { toJournalEntry } from "@/core/application/mappers/JournalEntryMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiJournalEntryRepository implements IJournalEntryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetJournalEntriesParams): Promise<PaginatedResult<JournalEntry>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.JOURNAL_ENTRIES.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<JournalEntryDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toJournalEntry(dto as JournalEntryDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<JournalEntry | null> {
    try {
      const dto = await this.httpClient.get<JournalEntryDto>(
        API_ENDPOINTS.JOURNAL_ENTRIES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toJournalEntry(dto as JournalEntryDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: JournalEntryWriteDto): Promise<JournalEntry> {
    const dto = await this.httpClient.post<JournalEntryDto>(
      API_ENDPOINTS.JOURNAL_ENTRIES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create journal entry response missing id");
    return toJournalEntry(dto as JournalEntryDto & { id: string });
  }

  async update(id: string, data: JournalEntryWriteDto): Promise<JournalEntry> {
    const dto = await this.httpClient.patch<JournalEntryDto>(
      API_ENDPOINTS.JOURNAL_ENTRIES.UPDATE(id),
      data
    );
    return toJournalEntry(
      { ...dto, id: dto?.id ?? id } as JournalEntryDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.JOURNAL_ENTRIES.DELETE(id));
  }
}
