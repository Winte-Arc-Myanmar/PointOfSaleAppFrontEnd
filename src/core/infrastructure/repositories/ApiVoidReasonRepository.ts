import type {
  VoidReasonCreateDto,
  VoidReasonDto,
  VoidReasonUpdateDto,
} from "@/core/application/dtos/VoidReasonDto";
import { toVoidReason } from "@/core/application/mappers/VoidReasonMapper";
import type { VoidReason } from "@/core/domain/entities/VoidReason";
import type {
  GetVoidReasonsParams,
  IVoidReasonRepository,
} from "@/core/domain/repositories/IVoidReasonRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "@/core/infrastructure/api/parsePaginatedResponse";

export class ApiVoidReasonRepository implements IVoidReasonRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetVoidReasonsParams): Promise<PaginatedResult<VoidReason>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.VOID_REASONS.LIST,
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
    const parsed = parsePaginatedResponse<VoidReasonDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toVoidReason(dto as VoidReasonDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<VoidReason | null> {
    try {
      const dto = await this.httpClient.get<VoidReasonDto>(
        API_ENDPOINTS.VOID_REASONS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toVoidReason(dto as VoidReasonDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: VoidReasonCreateDto): Promise<VoidReason> {
    const dto = await this.httpClient.post<VoidReasonDto>(
      API_ENDPOINTS.VOID_REASONS.CREATE,
      data,
    );
    if (!dto?.id) throw new Error("Create void reason response missing id");
    return toVoidReason(dto as VoidReasonDto & { id: string });
  }

  async update(id: string, data: VoidReasonUpdateDto): Promise<VoidReason> {
    const dto = await this.httpClient.patch<VoidReasonDto>(
      API_ENDPOINTS.VOID_REASONS.UPDATE(id),
      data,
    );
    return toVoidReason({ ...dto, id: dto?.id ?? id } as VoidReasonDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.VOID_REASONS.DELETE(id));
  }
}
