import type {
  IJournalLineRepository,
  GetJournalLinesParams,
  JournalLineWriteDto,
} from "@/core/domain/repositories/IJournalLineRepository";
import type { JournalLine } from "@/core/domain/entities/JournalLine";
import type { JournalLineDto } from "@/core/application/dtos/JournalLineDto";
import { toJournalLine } from "@/core/application/mappers/JournalLineMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(data: JournalLineWriteDto): Record<string, unknown> {
  return {
    accountId: data.accountId,
    transactionCurrency: data.transactionCurrency,
    transactionDebit: toApiDecimalStringFixed4(data.transactionDebit),
    transactionCredit: toApiDecimalStringFixed4(data.transactionCredit),
    exchangeRate: toApiDecimalStringFixed4(data.exchangeRate),
    baseDebit: toApiDecimalStringFixed4(data.baseDebit),
    baseCredit: toApiDecimalStringFixed4(data.baseCredit),
  };
}

export class ApiJournalLineRepository implements IJournalLineRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    journalEntryId: string,
    params?: GetJournalLinesParams
  ): Promise<PaginatedResult<JournalLine>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.JOURNAL_ENTRIES.LINES(journalEntryId).LIST,
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
    const parsed = parsePaginatedResponse<JournalLineDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toJournalLine(journalEntryId, dto as JournalLineDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(journalEntryId: string, id: string): Promise<JournalLine | null> {
    try {
      const dto = await this.httpClient.get<JournalLineDto>(
        API_ENDPOINTS.JOURNAL_ENTRIES.LINES(journalEntryId).BY_ID(id)
      );
      if (!dto?.id) return null;
      return toJournalLine(journalEntryId, dto as JournalLineDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    journalEntryId: string,
    data: JournalLineWriteDto
  ): Promise<JournalLine> {
    const dto = await this.httpClient.post<JournalLineDto>(
      API_ENDPOINTS.JOURNAL_ENTRIES.LINES(journalEntryId).CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create journal line response missing id");
    return toJournalLine(journalEntryId, dto as JournalLineDto & { id: string });
  }

  async update(
    journalEntryId: string,
    id: string,
    data: JournalLineWriteDto
  ): Promise<JournalLine> {
    const dto = await this.httpClient.patch<JournalLineDto>(
      API_ENDPOINTS.JOURNAL_ENTRIES.LINES(journalEntryId).UPDATE(id),
      normalizeWritePayload(data)
    );
    return toJournalLine(
      journalEntryId,
      { ...dto, id: dto?.id ?? id } as JournalLineDto & { id: string }
    );
  }

  async delete(journalEntryId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.JOURNAL_ENTRIES.LINES(journalEntryId).DELETE(id)
    );
  }
}
