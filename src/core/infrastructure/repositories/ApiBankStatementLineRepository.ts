import type {
  IBankStatementLineRepository,
  GetBankStatementLinesParams,
  BankStatementLineWriteDto,
} from "@/core/domain/repositories/IBankStatementLineRepository";
import type { BankStatementLine } from "@/core/domain/entities/BankStatementLine";
import type { BankStatementLineDto } from "@/core/application/dtos/BankStatementLineDto";
import { toBankStatementLine } from "@/core/application/mappers/BankStatementLineMapper";
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

function normalizeWritePayload(data: BankStatementLineWriteDto): Record<string, unknown> {
  return {
    transactionDate: data.transactionDate,
    description: data.description,
    referenceNumber: data.referenceNumber,
    amount: toApiDecimalStringFixed4(data.amount),
    status: data.status,
  };
}

export class ApiBankStatementLineRepository implements IBankStatementLineRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    bankStatementId: string,
    params?: GetBankStatementLinesParams
  ): Promise<PaginatedResult<BankStatementLine>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.BANK_STATEMENTS.LINES(bankStatementId).LIST,
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
    const parsed = parsePaginatedResponse<BankStatementLineDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toBankStatementLine(bankStatementId, dto as BankStatementLineDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(bankStatementId: string, id: string): Promise<BankStatementLine | null> {
    try {
      const dto = await this.httpClient.get<BankStatementLineDto>(
        API_ENDPOINTS.BANK_STATEMENTS.LINES(bankStatementId).BY_ID(id)
      );
      if (!dto?.id) return null;
      return toBankStatementLine(
        bankStatementId,
        dto as BankStatementLineDto & { id: string }
      );
    } catch {
      return null;
    }
  }

  async create(
    bankStatementId: string,
    data: BankStatementLineWriteDto
  ): Promise<BankStatementLine> {
    const dto = await this.httpClient.post<BankStatementLineDto>(
      API_ENDPOINTS.BANK_STATEMENTS.LINES(bankStatementId).CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create bank statement line response missing id");
    return toBankStatementLine(
      bankStatementId,
      dto as BankStatementLineDto & { id: string }
    );
  }

  async update(
    bankStatementId: string,
    id: string,
    data: BankStatementLineWriteDto
  ): Promise<BankStatementLine> {
    const dto = await this.httpClient.patch<BankStatementLineDto>(
      API_ENDPOINTS.BANK_STATEMENTS.LINES(bankStatementId).UPDATE(id),
      normalizeWritePayload(data)
    );
    return toBankStatementLine(
      bankStatementId,
      { ...dto, id: dto?.id ?? id } as BankStatementLineDto & { id: string }
    );
  }

  async delete(bankStatementId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.BANK_STATEMENTS.LINES(bankStatementId).DELETE(id)
    );
  }
}
