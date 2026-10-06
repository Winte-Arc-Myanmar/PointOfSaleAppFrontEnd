import type { Hostess, HostessInput } from "@/core/domain/entities/Hostess";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "../api/parsePaginatedResponse";

function toHostess(dto: Hostess): Hostess {
  return {
    id: String(dto.id),
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    nickname: dto.nickname ?? null,
    phoneNumber: dto.phoneNumber ?? null,
    imageUrl: dto.imageUrl ?? null,
    isActive: dto.isActive !== false,
    inRoom: dto.inRoom ?? null,
  };
}

export interface GetHostessesParams {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}

export class ApiHostessRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetHostessesParams): Promise<PaginatedResult<Hostess>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.HOSTESSES.LIST, {
      params: {
        page,
        limit,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.activeOnly ? { activeOnly: "true" } : {}),
      },
    });
    const parsed = parsePaginatedResponse<Hostess>({ data, meta }, { page, limit });
    return mapPaginatedResult(parsed, toHostess, (dto) => !!dto?.id);
  }

  async getById(id: string): Promise<Hostess> {
    return toHostess(await this.httpClient.get<Hostess>(API_ENDPOINTS.HOSTESSES.BY_ID(id)));
  }

  async create(data: HostessInput): Promise<Hostess> {
    return toHostess(await this.httpClient.post<Hostess>(API_ENDPOINTS.HOSTESSES.LIST, data));
  }

  async update(id: string, data: Partial<HostessInput>): Promise<Hostess> {
    return toHostess(await this.httpClient.patch<Hostess>(API_ENDPOINTS.HOSTESSES.BY_ID(id), data));
  }

  async remove(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.HOSTESSES.BY_ID(id));
  }
}
