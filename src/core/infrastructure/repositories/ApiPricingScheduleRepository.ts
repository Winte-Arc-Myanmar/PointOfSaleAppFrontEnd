import type {
  PricingScheduleCreateDto,
  PricingScheduleDto,
  PricingScheduleUpdateDto,
} from "@/core/application/dtos/PricingScheduleDto";
import { toPricingSchedule } from "@/core/application/mappers/PricingScheduleMapper";
import type { PricingSchedule } from "@/core/domain/entities/PricingSchedule";
import type {
  GetPricingSchedulesParams,
  IPricingScheduleRepository,
} from "@/core/domain/repositories/IPricingScheduleRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "@/core/infrastructure/api/parsePaginatedResponse";

function normalizeRules(
  rules:
    | PricingScheduleCreateDto["rules"]
    | PricingScheduleUpdateDto["rules"],
) {
  if (!rules) return undefined;
  return rules.map((item) => ({
    ...item,
    adjustmentValue: Number(item.adjustmentValue),
    variantId: item.variantId?.trim() || undefined,
    categoryId: item.categoryId?.trim() || undefined,
  }));
}

export class ApiPricingScheduleRepository implements IPricingScheduleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetPricingSchedulesParams,
  ): Promise<PaginatedResult<PricingSchedule>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.PRICING_SCHEDULES.LIST,
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
    const parsed = parsePaginatedResponse<PricingScheduleDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toPricingSchedule(dto as PricingScheduleDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<PricingSchedule | null> {
    try {
      const dto = await this.httpClient.get<PricingScheduleDto>(
        API_ENDPOINTS.PRICING_SCHEDULES.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toPricingSchedule(dto as PricingScheduleDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: PricingScheduleCreateDto): Promise<PricingSchedule> {
    const dto = await this.httpClient.post<PricingScheduleDto>(
      API_ENDPOINTS.PRICING_SCHEDULES.CREATE,
      {
        ...data,
        priority: Number(data.priority),
        rules: normalizeRules(data.rules),
      },
    );
    if (!dto?.id) throw new Error("Create pricing schedule response missing id");
    return toPricingSchedule(dto as PricingScheduleDto & { id: string });
  }

  async update(id: string, data: PricingScheduleUpdateDto): Promise<PricingSchedule> {
    const payload: PricingScheduleUpdateDto = {
      ...data,
      ...(data.priority != null ? { priority: Number(data.priority) } : {}),
      ...(data.rules ? { rules: normalizeRules(data.rules) } : {}),
    };
    const dto = await this.httpClient.patch<PricingScheduleDto>(
      API_ENDPOINTS.PRICING_SCHEDULES.UPDATE(id),
      payload,
    );
    return toPricingSchedule({
      ...dto,
      id: dto?.id ?? id,
    } as PricingScheduleDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.PRICING_SCHEDULES.DELETE(id));
  }
}
