import type {
  IBankStatementRepository,
  GetBankStatementsParams,
  BankStatementWriteDto,
} from "@/core/domain/repositories/IBankStatementRepository";
import type { BankStatement } from "@/core/domain/entities/BankStatement";
import type { BankStatementDto } from "@/core/application/dtos/BankStatementDto";
import { toBankStatement } from "@/core/application/mappers/BankStatementMapper";
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

function normalizeWritePayload(data: BankStatementWriteDto): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    glAccountId: data.glAccountId,
    statementDate: data.statementDate,
    openingBalance: toApiDecimalStringFixed4(data.openingBalance),
    closingBalance: toApiDecimalStringFixed4(data.closingBalance),
  };
}

export class ApiBankStatementRepository implements IBankStatementRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetBankStatementsParams): Promise<PaginatedResult<BankStatement>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.BANK_STATEMENTS.LIST,
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
    const parsed = parsePaginatedResponse<BankStatementDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toBankStatement(dto as BankStatementDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<BankStatement | null> {
    try {
      const dto = await this.httpClient.get<BankStatementDto>(
        API_ENDPOINTS.BANK_STATEMENTS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toBankStatement(dto as BankStatementDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: BankStatementWriteDto): Promise<BankStatement> {
    const dto = await this.httpClient.post<BankStatementDto>(
      API_ENDPOINTS.BANK_STATEMENTS.CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create bank statement response missing id");
    return toBankStatement(dto as BankStatementDto & { id: string });
  }

  async update(id: string, data: BankStatementWriteDto): Promise<BankStatement> {
    const dto = await this.httpClient.patch<BankStatementDto>(
      API_ENDPOINTS.BANK_STATEMENTS.UPDATE(id),
      normalizeWritePayload(data)
    );
    return toBankStatement(
      { ...dto, id: dto?.id ?? id } as BankStatementDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.BANK_STATEMENTS.DELETE(id));
  }
}
