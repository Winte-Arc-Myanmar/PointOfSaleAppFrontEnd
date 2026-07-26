import type {
  ITransferOrderRepository,
  GetTransferOrdersParams,
  TransferOrderWriteDto,
} from "@/core/domain/repositories/ITransferOrderRepository";
import type { TransferOrder } from "@/core/domain/entities/TransferOrder";
import type { TransferOrderDto } from "@/core/application/dtos/TransferOrderDto";
import { toTransferOrder } from "@/core/application/mappers/TransferOrderMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function normalizeWritePayload(
  data: TransferOrderWriteDto,
): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    sourceLocationId: data.sourceLocationId,
    transitLocationId: data.transitLocationId,
    destinationLocationId: data.destinationLocationId,
    transferNumber: data.transferNumber,
    createdBy: data.createdBy,
  };
}

export class ApiTransferOrderRepository implements ITransferOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetTransferOrdersParams,
  ): Promise<PaginatedResult<TransferOrder>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.TRANSFER_ORDERS.LIST,
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
    const parsed = parsePaginatedResponse<TransferOrderDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toTransferOrder(dto as TransferOrderDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<TransferOrder | null> {
    try {
      const dto = await this.httpClient.get<TransferOrderDto>(
        API_ENDPOINTS.TRANSFER_ORDERS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toTransferOrder(dto as TransferOrderDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: TransferOrderWriteDto): Promise<TransferOrder> {
    const dto = await this.httpClient.post<TransferOrderDto>(
      API_ENDPOINTS.TRANSFER_ORDERS.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id) throw new Error("Create transfer order response missing id");
    return toTransferOrder(dto as TransferOrderDto & { id: string });
  }

  async update(
    id: string,
    data: TransferOrderWriteDto,
  ): Promise<TransferOrder> {
    const dto = await this.httpClient.patch<TransferOrderDto>(
      API_ENDPOINTS.TRANSFER_ORDERS.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toTransferOrder({
      ...dto,
      id: dto?.id ?? id,
    } as TransferOrderDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.TRANSFER_ORDERS.DELETE(id));
  }
}
