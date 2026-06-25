import type {
  IExchangeRateRepository,
  GetExchangeRatesParams,
} from "@/core/domain/repositories/IExchangeRateRepository";
import type { ExchangeRate } from "@/core/domain/entities/ExchangeRate";
import type { ExchangeRateDto } from "@/core/application/dtos/ExchangeRateDto";
import { toExchangeRate } from "@/core/application/mappers/ExchangeRateMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiExchangeRateRepository implements IExchangeRateRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetExchangeRatesParams): Promise<PaginatedResult<ExchangeRate>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.EXCHANGE_RATES.LIST,
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
    const parsed = parsePaginatedResponse<ExchangeRateDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toExchangeRate(dto as ExchangeRateDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<ExchangeRate | null> {
    try {
      const dto = await this.httpClient.get<ExchangeRateDto>(
        API_ENDPOINTS.EXCHANGE_RATES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toExchangeRate(dto as ExchangeRateDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ExchangeRate> {
    const dto = await this.httpClient.post<ExchangeRateDto>(
      API_ENDPOINTS.EXCHANGE_RATES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create exchange rate response missing id");
    return toExchangeRate(dto as ExchangeRateDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ExchangeRate> {
    const dto = await this.httpClient.patch<ExchangeRateDto>(
      API_ENDPOINTS.EXCHANGE_RATES.UPDATE(id),
      data
    );
    return toExchangeRate(
      { ...dto, id: dto?.id ?? id } as ExchangeRateDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.EXCHANGE_RATES.DELETE(id));
  }
}
