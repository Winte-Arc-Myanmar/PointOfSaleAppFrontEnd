import type {
  TipPoolAllocationDto,
  TipPoolCreateAllocationDto,
  TipPoolCreateDto,
  TipPoolDto,
  TipPoolUpdateAllocationDto,
  TipPoolUpdateDto,
} from "@/core/application/dtos/TipPoolDto";
import { toTipPool, toTipPoolAllocation } from "@/core/application/mappers/TipPoolMapper";
import type { TipPool, TipPoolAllocation } from "@/core/domain/entities/TipPool";
import type {
  GetTipPoolAllocationsParams,
  GetTipPoolsParams,
  ITipPoolRepository,
} from "@/core/domain/repositories/ITipPoolRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "@/core/infrastructure/api/parsePaginatedResponse";

export class ApiTipPoolRepository implements ITipPoolRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetTipPoolsParams): Promise<PaginatedResult<TipPool>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.TIP_POOLS.LIST, {
      params: {
        page,
        limit,
        ...(params?.locationId ? { locationId: params.locationId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params?.toDate ? { toDate: params.toDate } : {}),
      },
    });
    const parsed = parsePaginatedResponse<TipPoolDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toTipPool(dto as TipPoolDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<TipPool | null> {
    try {
      const dto = await this.httpClient.get<TipPoolDto>(API_ENDPOINTS.TIP_POOLS.BY_ID(id));
      if (!dto?.id) return null;
      return toTipPool(dto as TipPoolDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: TipPoolCreateDto): Promise<TipPool> {
    const dto = await this.httpClient.post<TipPoolDto>(API_ENDPOINTS.TIP_POOLS.CREATE, data);
    if (!dto?.id) throw new Error("Create tip pool response missing id");
    return toTipPool(dto as TipPoolDto & { id: string });
  }

  async update(id: string, data: TipPoolUpdateDto): Promise<TipPool> {
    const dto = await this.httpClient.patch<TipPoolDto>(API_ENDPOINTS.TIP_POOLS.UPDATE(id), data);
    return toTipPool({ ...dto, id: dto?.id ?? id } as TipPoolDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.TIP_POOLS.DELETE(id));
  }

  async distribute(id: string): Promise<TipPool> {
    const dto = await this.httpClient.post<TipPoolDto>(API_ENDPOINTS.TIP_POOLS.DISTRIBUTE(id));
    return toTipPool({ ...dto, id: dto?.id ?? id } as TipPoolDto & { id: string });
  }

  async settle(id: string): Promise<TipPool> {
    const dto = await this.httpClient.post<TipPoolDto>(API_ENDPOINTS.TIP_POOLS.SETTLE(id));
    return toTipPool({ ...dto, id: dto?.id ?? id } as TipPoolDto & { id: string });
  }

  async getAllocations(
    id: string,
    params?: GetTipPoolAllocationsParams,
  ): Promise<PaginatedResult<TipPoolAllocation>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.TIP_POOLS.ALLOCATIONS.LIST(id),
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
    const parsed = parsePaginatedResponse<TipPoolAllocationDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toTipPoolAllocation(dto as TipPoolAllocationDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async addAllocation(id: string, data: TipPoolCreateAllocationDto): Promise<TipPoolAllocation> {
    const dto = await this.httpClient.post<TipPoolAllocationDto>(
      API_ENDPOINTS.TIP_POOLS.ALLOCATIONS.CREATE(id),
      data,
    );
    return toTipPoolAllocation({
      ...dto,
      id: dto?.id ?? "",
    } as TipPoolAllocationDto & { id: string });
  }

  async updateAllocation(
    id: string,
    allocationId: string,
    data: TipPoolUpdateAllocationDto,
  ): Promise<TipPoolAllocation> {
    const dto = await this.httpClient.patch<TipPoolAllocationDto>(
      API_ENDPOINTS.TIP_POOLS.ALLOCATIONS.UPDATE(id, allocationId),
      data,
    );
    return toTipPoolAllocation({
      ...dto,
      id: dto?.id ?? allocationId,
      poolId: dto?.poolId ?? id,
    } as TipPoolAllocationDto & { id: string });
  }

  async removeAllocation(id: string, allocationId: string): Promise<TipPoolAllocation> {
    const dto = await this.httpClient.delete<TipPoolAllocationDto>(
      API_ENDPOINTS.TIP_POOLS.ALLOCATIONS.DELETE(id, allocationId),
    );
    return toTipPoolAllocation({
      ...dto,
      id: dto?.id ?? allocationId,
      poolId: dto?.poolId ?? id,
    } as TipPoolAllocationDto & { id: string });
  }
}
