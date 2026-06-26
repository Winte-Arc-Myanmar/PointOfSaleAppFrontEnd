import type {
  IDepreciationScheduleRepository,
  GetDepreciationSchedulesParams,
  DepreciationScheduleWriteDto,
} from "@/core/domain/repositories/IDepreciationScheduleRepository";
import type { DepreciationSchedule } from "@/core/domain/entities/DepreciationSchedule";
import type { DepreciationScheduleDto } from "@/core/application/dtos/DepreciationScheduleDto";
import { toDepreciationSchedule } from "@/core/application/mappers/DepreciationScheduleMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function normalizeWritePayload(
  data: DepreciationScheduleWriteDto
): Record<string, unknown> {
  return {
    scheduledDate: data.scheduledDate,
    depreciationAmount: String(data.depreciationAmount).trim(),
    isPosted: data.isPosted,
    ...(data.postedJournalEntryId
      ? { postedJournalEntryId: data.postedJournalEntryId }
      : {}),
  };
}

export class ApiDepreciationScheduleRepository implements IDepreciationScheduleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    fixedAssetId: string,
    params?: GetDepreciationSchedulesParams
  ): Promise<PaginatedResult<DepreciationSchedule>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.FIXED_ASSETS.SCHEDULES(fixedAssetId).LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      }
    );
    const parsed = parsePaginatedResponse<DepreciationScheduleDto>(
      { data, meta },
      { page, limit }
    );
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toDepreciationSchedule(
          fixedAssetId,
          dto as DepreciationScheduleDto & { id: string }
        ),
      (dto) => !!dto?.id
    );
  }

  async getById(fixedAssetId: string, id: string): Promise<DepreciationSchedule | null> {
    try {
      const dto = await this.httpClient.get<DepreciationScheduleDto>(
        API_ENDPOINTS.FIXED_ASSETS.SCHEDULES(fixedAssetId).BY_ID(id)
      );
      if (!dto?.id) return null;
      return toDepreciationSchedule(
        fixedAssetId,
        dto as DepreciationScheduleDto & { id: string }
      );
    } catch {
      return null;
    }
  }

  async create(
    fixedAssetId: string,
    data: DepreciationScheduleWriteDto
  ): Promise<DepreciationSchedule> {
    const dto = await this.httpClient.post<DepreciationScheduleDto>(
      API_ENDPOINTS.FIXED_ASSETS.SCHEDULES(fixedAssetId).CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create depreciation schedule response missing id");
    return toDepreciationSchedule(
      fixedAssetId,
      dto as DepreciationScheduleDto & { id: string }
    );
  }

  async update(
    fixedAssetId: string,
    id: string,
    data: DepreciationScheduleWriteDto
  ): Promise<DepreciationSchedule> {
    const dto = await this.httpClient.patch<DepreciationScheduleDto>(
      API_ENDPOINTS.FIXED_ASSETS.SCHEDULES(fixedAssetId).UPDATE(id),
      normalizeWritePayload(data)
    );
    return toDepreciationSchedule(fixedAssetId, {
      ...dto,
      id: dto?.id ?? id,
    } as DepreciationScheduleDto & { id: string });
  }

  async delete(fixedAssetId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.FIXED_ASSETS.SCHEDULES(fixedAssetId).DELETE(id)
    );
  }
}
