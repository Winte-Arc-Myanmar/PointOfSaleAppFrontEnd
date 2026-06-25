import type {
  ITaxRateRepository,
  GetTaxRatesParams,
} from "@/core/domain/repositories/ITaxRateRepository";
import type { TaxRate } from "@/core/domain/entities/TaxRate";
import type { TaxRateDto } from "@/core/application/dtos/TaxRateDto";
import { toTaxRate } from "@/core/application/mappers/TaxRateMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiTaxRateRepository implements ITaxRateRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetTaxRatesParams): Promise<PaginatedResult<TaxRate>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.TAX_RATES.LIST,
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
    const parsed = parsePaginatedResponse<TaxRateDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toTaxRate(dto as TaxRateDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<TaxRate | null> {
    try {
      const dto = await this.httpClient.get<TaxRateDto>(
        API_ENDPOINTS.TAX_RATES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toTaxRate(dto as TaxRateDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<TaxRate> {
    const dto = await this.httpClient.post<TaxRateDto>(
      API_ENDPOINTS.TAX_RATES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create tax rate response missing id");
    return toTaxRate(dto as TaxRateDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<TaxRate> {
    const dto = await this.httpClient.patch<TaxRateDto>(
      API_ENDPOINTS.TAX_RATES.UPDATE(id),
      data
    );
    return toTaxRate({ ...dto, id: dto?.id ?? id } as TaxRateDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.TAX_RATES.DELETE(id));
  }
}
