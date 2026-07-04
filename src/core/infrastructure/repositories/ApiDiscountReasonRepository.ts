import type {
  DiscountReasonCreateDto,
  DiscountReasonDto,
  DiscountReasonUpdateDto,
} from "@/core/application/dtos/DiscountReasonDto";
import { toDiscountReason } from "@/core/application/mappers/DiscountReasonMapper";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";
import type {
  GetDiscountReasonsParams,
  IDiscountReasonRepository,
} from "@/core/domain/repositories/IDiscountReasonRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "@/core/infrastructure/api/parsePaginatedResponse";

export class ApiDiscountReasonRepository implements IDiscountReasonRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetDiscountReasonsParams): Promise<PaginatedResult<DiscountReason>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.DISCOUNT_REASONS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
          ...(params?.activeOnly !== undefined ? { activeOnly: params.activeOnly } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<DiscountReasonDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toDiscountReason(dto as DiscountReasonDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<DiscountReason | null> {
    try {
      const dto = await this.httpClient.get<DiscountReasonDto>(
        API_ENDPOINTS.DISCOUNT_REASONS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toDiscountReason(dto as DiscountReasonDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: DiscountReasonCreateDto): Promise<DiscountReason> {
    const dto = await this.httpClient.post<DiscountReasonDto>(
      API_ENDPOINTS.DISCOUNT_REASONS.CREATE,
      data,
    );
    if (!dto?.id) throw new Error("Create discount reason response missing id");
    return toDiscountReason(dto as DiscountReasonDto & { id: string });
  }

  async update(id: string, data: DiscountReasonUpdateDto): Promise<DiscountReason> {
    const dto = await this.httpClient.patch<DiscountReasonDto>(
      API_ENDPOINTS.DISCOUNT_REASONS.UPDATE(id),
      data,
    );
    return toDiscountReason({ ...dto, id: dto?.id ?? id } as DiscountReasonDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.DISCOUNT_REASONS.DELETE(id));
  }
}
