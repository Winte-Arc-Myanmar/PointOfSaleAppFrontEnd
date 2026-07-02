import type {
  GetKdsStationsParams,
  IKdsStationRepository,
} from "@/core/domain/repositories/IKdsStationRepository";
import type { KdsStation } from "@/core/domain/entities/KdsStation";
import type {
  KdsStationCreateDto,
  KdsStationDto,
  KdsStationUpdateDto,
} from "@/core/application/dtos/KdsStationDto";
import { toKdsStation } from "@/core/application/mappers/KdsStationMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "../api/parsePaginatedResponse";

export class ApiKdsStationRepository implements IKdsStationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetKdsStationsParams): Promise<PaginatedResult<KdsStation>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.KDS_STATIONS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.locationId ? { locationId: params.locationId } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<KdsStationDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toKdsStation(dto as KdsStationDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<KdsStation | null> {
    try {
      const dto = await this.httpClient.get<KdsStationDto>(API_ENDPOINTS.KDS_STATIONS.BY_ID(id));
      if (!dto?.id) return null;
      return toKdsStation(dto as KdsStationDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: KdsStationCreateDto): Promise<KdsStation> {
    const dto = await this.httpClient.post<KdsStationDto>(API_ENDPOINTS.KDS_STATIONS.CREATE, data);
    if (!dto?.id) throw new Error("Create KDS station response missing id");
    return toKdsStation(dto as KdsStationDto & { id: string });
  }

  async update(id: string, data: KdsStationUpdateDto): Promise<KdsStation> {
    const dto = await this.httpClient.patch<KdsStationDto>(
      API_ENDPOINTS.KDS_STATIONS.UPDATE(id),
      data,
    );
    return toKdsStation({ ...dto, id: dto?.id ?? id } as KdsStationDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.KDS_STATIONS.DELETE(id));
  }
}
