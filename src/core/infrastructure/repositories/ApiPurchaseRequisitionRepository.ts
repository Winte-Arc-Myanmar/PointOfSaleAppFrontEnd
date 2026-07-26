import type {
  IPurchaseRequisitionRepository,
  GetPurchaseRequisitionsParams,
  PurchaseRequisitionWriteDto,
} from "@/core/domain/repositories/IPurchaseRequisitionRepository";
import type { PurchaseRequisition } from "@/core/domain/entities/PurchaseRequisition";
import type { PurchaseRequisitionDto } from "@/core/application/dtos/PurchaseRequisitionDto";
import { toPurchaseRequisition } from "@/core/application/mappers/PurchaseRequisitionMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function normalizeWritePayload(
  data: PurchaseRequisitionWriteDto,
): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    requestedBy: data.requestedBy,
    department: data.department,
    justification: data.justification,
  };
}

export class ApiPurchaseRequisitionRepository
  implements IPurchaseRequisitionRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetPurchaseRequisitionsParams,
  ): Promise<PaginatedResult<PurchaseRequisition>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.PURCHASE_REQUISITIONS.LIST,
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
    const parsed = parsePaginatedResponse<PurchaseRequisitionDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toPurchaseRequisition(dto as PurchaseRequisitionDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<PurchaseRequisition | null> {
    try {
      const dto = await this.httpClient.get<PurchaseRequisitionDto>(
        API_ENDPOINTS.PURCHASE_REQUISITIONS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toPurchaseRequisition(
        dto as PurchaseRequisitionDto & { id: string },
      );
    } catch {
      return null;
    }
  }

  async create(
    data: PurchaseRequisitionWriteDto,
  ): Promise<PurchaseRequisition> {
    const dto = await this.httpClient.post<PurchaseRequisitionDto>(
      API_ENDPOINTS.PURCHASE_REQUISITIONS.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id)
      throw new Error("Create purchase requisition response missing id");
    return toPurchaseRequisition(
      dto as PurchaseRequisitionDto & { id: string },
    );
  }

  async update(
    id: string,
    data: PurchaseRequisitionWriteDto,
  ): Promise<PurchaseRequisition> {
    const dto = await this.httpClient.patch<PurchaseRequisitionDto>(
      API_ENDPOINTS.PURCHASE_REQUISITIONS.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toPurchaseRequisition({
      ...dto,
      id: dto?.id ?? id,
    } as PurchaseRequisitionDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.PURCHASE_REQUISITIONS.DELETE(id));
  }
}
