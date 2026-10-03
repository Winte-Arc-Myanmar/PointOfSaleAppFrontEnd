import type { KtvRoom, KtvRoomInput } from "@/core/domain/entities/KtvRoom";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "../api/parsePaginatedResponse";

type KtvRoomDto = Omit<KtvRoom, "pricePerHour"> & { sessionPrice?: string | number | null };

function toKtvRoom(dto: KtvRoomDto): KtvRoom {
  return {
    id: String(dto.id),
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    roomNumber: dto.roomNumber ?? "",
    name: dto.name ?? null,
    capacity: Number(dto.capacity) || 0,
    pricePerHour: Number(dto.sessionPrice ?? 0) || 0,
    minimumMinutes: Number(dto.minimumMinutes) || 0,
    incrementMinutes: Number(dto.incrementMinutes) || 0,
    graceMinutes: Number(dto.graceMinutes) || 0,
    roundingMode: dto.roundingMode ?? "UP",
    status: dto.status ?? "AVAILABLE",
  };
}

function toBody({ pricePerHour, ...rest }: Partial<KtvRoomInput>) {
  return { ...rest, ...(pricePerHour !== undefined ? { sessionPrice: pricePerHour } : {}) };
}

export interface GetKtvRoomsParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
}

export class ApiKtvRoomRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetKtvRoomsParams): Promise<PaginatedResult<KtvRoom>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.KTV_ROOMS.LIST, {
      params: {
        page,
        limit,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.locationId ? { locationId: params.locationId } : {}),
      },
    });
    const parsed = parsePaginatedResponse<KtvRoomDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(parsed, toKtvRoom, (dto) => !!dto?.id);
  }

  async getById(id: string): Promise<KtvRoom> {
    return toKtvRoom(await this.httpClient.get<KtvRoomDto>(API_ENDPOINTS.KTV_ROOMS.BY_ID(id)));
  }

  async create(data: KtvRoomInput): Promise<KtvRoom> {
    return toKtvRoom(await this.httpClient.post<KtvRoomDto>(API_ENDPOINTS.KTV_ROOMS.LIST, toBody(data)));
  }

  async update(id: string, data: Partial<KtvRoomInput>): Promise<KtvRoom> {
    return toKtvRoom(
      await this.httpClient.patch<KtvRoomDto>(API_ENDPOINTS.KTV_ROOMS.BY_ID(id), toBody(data)),
    );
  }

  async markReady(id: string): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.KTV_ROOMS.READY(id), {});
  }

  async remove(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.KTV_ROOMS.BY_ID(id));
  }
}
