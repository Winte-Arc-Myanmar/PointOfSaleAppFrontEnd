import type {
  IDiningZoneRepository,
  GetDiningZonesParams,
} from "@/core/domain/repositories/IDiningZoneRepository";
import type { DiningZone } from "@/core/domain/entities/DiningZone";
import type {
  DiningZoneDto,
  DiningZoneCreateDto,
  DiningZoneUpdateDto,
} from "@/core/application/dtos/DiningZoneDto";
import { toDiningZone } from "@/core/application/mappers/DiningZoneMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiDiningZoneRepository implements IDiningZoneRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetDiningZonesParams): Promise<PaginatedResult<DiningZone>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.DINING_ZONES.LIST,
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
    const parsed = parsePaginatedResponse<DiningZoneDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toDiningZone(dto as DiningZoneDto & { id: string }),
      (dto) => !!dto?.id
    );
  }

  async getById(id: string): Promise<DiningZone | null> {
    try {
      const dto = await this.httpClient.get<DiningZoneDto>(
        API_ENDPOINTS.DINING_ZONES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toDiningZone(dto as DiningZoneDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: DiningZoneCreateDto): Promise<DiningZone> {
    const dto = await this.httpClient.post<DiningZoneDto>(
      API_ENDPOINTS.DINING_ZONES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create dining zone response missing id");
    return toDiningZone(dto as DiningZoneDto & { id: string });
  }

  async update(id: string, data: DiningZoneUpdateDto): Promise<DiningZone> {
    const dto = await this.httpClient.patch<DiningZoneDto>(
      API_ENDPOINTS.DINING_ZONES.UPDATE(id),
      data
    );
    return toDiningZone({ ...dto, id: dto?.id ?? id } as DiningZoneDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.DINING_ZONES.DELETE(id));
  }
}
