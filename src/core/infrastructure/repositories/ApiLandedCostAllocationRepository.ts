import type {
  ILandedCostAllocationRepository,
  GetLandedCostAllocationsParams,
  LandedCostAllocationWriteDto,
} from "@/core/domain/repositories/ILandedCostAllocationRepository";
import type { LandedCostAllocation } from "@/core/domain/entities/LandedCostAllocation";
import type { LandedCostAllocationDto } from "@/core/application/dtos/LandedCostAllocationDto";
import { toLandedCostAllocation } from "@/core/application/mappers/LandedCostAllocationMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiAmountString(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string")
    n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function normalizeWritePayload(
  data: LandedCostAllocationWriteDto,
): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    sourceInvoiceId: data.sourceInvoiceId,
    targetGrnId: data.targetGrnId,
    targetGrnLineId: data.targetGrnLineId,
    allocationMethod: data.allocationMethod,
    allocatedAmount: toApiAmountString(data.allocatedAmount),
    glJournalPosted: Boolean(data.glJournalPosted),
  };
}

export class ApiLandedCostAllocationRepository
  implements ILandedCostAllocationRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetLandedCostAllocationsParams,
  ): Promise<PaginatedResult<LandedCostAllocation>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.LANDED_COST_ALLOCATIONS.LIST,
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
    const parsed = parsePaginatedResponse<LandedCostAllocationDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toLandedCostAllocation(dto as LandedCostAllocationDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<LandedCostAllocation | null> {
    try {
      const dto = await this.httpClient.get<LandedCostAllocationDto>(
        API_ENDPOINTS.LANDED_COST_ALLOCATIONS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toLandedCostAllocation(
        dto as LandedCostAllocationDto & { id: string },
      );
    } catch {
      return null;
    }
  }

  async create(
    data: LandedCostAllocationWriteDto,
  ): Promise<LandedCostAllocation> {
    const dto = await this.httpClient.post<LandedCostAllocationDto>(
      API_ENDPOINTS.LANDED_COST_ALLOCATIONS.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id)
      throw new Error("Create landed cost allocation response missing id");
    return toLandedCostAllocation(
      dto as LandedCostAllocationDto & { id: string },
    );
  }

  async update(
    id: string,
    data: LandedCostAllocationWriteDto,
  ): Promise<LandedCostAllocation> {
    const dto = await this.httpClient.patch<LandedCostAllocationDto>(
      API_ENDPOINTS.LANDED_COST_ALLOCATIONS.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toLandedCostAllocation({
      ...dto,
      id: dto?.id ?? id,
    } as LandedCostAllocationDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.LANDED_COST_ALLOCATIONS.DELETE(id),
    );
  }
}
