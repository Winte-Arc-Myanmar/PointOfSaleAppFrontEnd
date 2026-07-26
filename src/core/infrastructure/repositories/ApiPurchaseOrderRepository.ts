import type {
  IPurchaseOrderRepository,
  GetPurchaseOrdersParams,
  PurchaseOrderWriteDto,
} from "@/core/domain/repositories/IPurchaseOrderRepository";
import type { PurchaseOrder } from "@/core/domain/entities/PurchaseOrder";
import type { PurchaseOrderDto } from "@/core/application/dtos/PurchaseOrderDto";
import { toPurchaseOrder } from "@/core/application/mappers/PurchaseOrderMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function normalizeWritePayload(
  data: PurchaseOrderWriteDto,
): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    vendorId: data.vendorId,
    poNumber: data.poNumber,
    currency: data.currency,
    totalAmount: data.totalAmount,
    requisitionId: data.requisitionId,
    expectedDeliveryDate: data.expectedDeliveryDate,
  };
}

export class ApiPurchaseOrderRepository implements IPurchaseOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetPurchaseOrdersParams,
  ): Promise<PaginatedResult<PurchaseOrder>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.PURCHASE_ORDERS.LIST,
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
    const parsed = parsePaginatedResponse<PurchaseOrderDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toPurchaseOrder(dto as PurchaseOrderDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<PurchaseOrder | null> {
    try {
      const dto = await this.httpClient.get<PurchaseOrderDto>(
        API_ENDPOINTS.PURCHASE_ORDERS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toPurchaseOrder(dto as PurchaseOrderDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: PurchaseOrderWriteDto): Promise<PurchaseOrder> {
    const dto = await this.httpClient.post<PurchaseOrderDto>(
      API_ENDPOINTS.PURCHASE_ORDERS.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id) throw new Error("Create purchase order response missing id");
    return toPurchaseOrder(dto as PurchaseOrderDto & { id: string });
  }

  async update(
    id: string,
    data: PurchaseOrderWriteDto,
  ): Promise<PurchaseOrder> {
    const dto = await this.httpClient.patch<PurchaseOrderDto>(
      API_ENDPOINTS.PURCHASE_ORDERS.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toPurchaseOrder({
      ...dto,
      id: dto?.id ?? id,
    } as PurchaseOrderDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.PURCHASE_ORDERS.DELETE(id));
  }
}
