import type {
  IAccountingPeriodRepository,
  GetAccountingPeriodsParams,
} from "@/core/domain/repositories/IAccountingPeriodRepository";
import type { AccountingPeriod } from "@/core/domain/entities/AccountingPeriod";
import type { AccountingPeriodDto } from "@/core/application/dtos/AccountingPeriodDto";
import { toAccountingPeriod } from "@/core/application/mappers/AccountingPeriodMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiAccountingPeriodRepository implements IAccountingPeriodRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetAccountingPeriodsParams): Promise<PaginatedResult<AccountingPeriod>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.ACCOUNTING_PERIODS.LIST,
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
    const parsed = parsePaginatedResponse<AccountingPeriodDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toAccountingPeriod(dto as AccountingPeriodDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<AccountingPeriod | null> {
    try {
      const dto = await this.httpClient.get<AccountingPeriodDto>(
        API_ENDPOINTS.ACCOUNTING_PERIODS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toAccountingPeriod(dto as AccountingPeriodDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<AccountingPeriod> {
    const dto = await this.httpClient.post<AccountingPeriodDto>(
      API_ENDPOINTS.ACCOUNTING_PERIODS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create accounting period response missing id");
    return toAccountingPeriod(dto as AccountingPeriodDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<AccountingPeriod> {
    const dto = await this.httpClient.patch<AccountingPeriodDto>(
      API_ENDPOINTS.ACCOUNTING_PERIODS.UPDATE(id),
      data
    );
    return toAccountingPeriod(
      { ...dto, id: dto?.id ?? id } as AccountingPeriodDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.ACCOUNTING_PERIODS.DELETE(id));
  }
}
