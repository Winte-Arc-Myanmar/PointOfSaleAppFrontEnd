import type {
  ITransferOrderLineRepository,
  GetTransferOrderLinesParams,
  TransferOrderLineWriteDto,
} from "@/core/domain/repositories/ITransferOrderLineRepository";
import type { TransferOrderLine } from "@/core/domain/entities/TransferOrderLine";
import type { TransferOrderLineDto } from "@/core/application/dtos/TransferOrderLineDto";
import { toTransferOrderLine } from "@/core/application/mappers/TransferOrderLineMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string")
    n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(
  data: TransferOrderLineWriteDto,
): Record<string, unknown> {
  return {
    productId: data.productId,
    requestedQuantity: toApiDecimalStringFixed4(data.requestedQuantity),
    shippedQuantity: toApiDecimalStringFixed4(data.shippedQuantity),
    receivedQuantity: toApiDecimalStringFixed4(data.receivedQuantity),
  };
}

export class ApiTransferOrderLineRepository
  implements ITransferOrderLineRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    transferOrderId: string,
    params?: GetTransferOrderLinesParams,
  ): Promise<PaginatedResult<TransferOrderLine>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.TRANSFER_ORDERS.LINES(transferOrderId).LIST,
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
    const parsed = parsePaginatedResponse<TransferOrderLineDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toTransferOrderLine(
          transferOrderId,
          dto as TransferOrderLineDto & { id: string },
        ),
      (dto) => !!dto?.id,
    );
  }

  async getById(
    transferOrderId: string,
    id: string,
  ): Promise<TransferOrderLine | null> {
    try {
      const dto = await this.httpClient.get<TransferOrderLineDto>(
        API_ENDPOINTS.TRANSFER_ORDERS.LINES(transferOrderId).BY_ID(id),
      );
      if (!dto?.id) return null;
      return toTransferOrderLine(
        transferOrderId,
        dto as TransferOrderLineDto & { id: string },
      );
    } catch {
      return null;
    }
  }

  async create(
    transferOrderId: string,
    data: TransferOrderLineWriteDto,
  ): Promise<TransferOrderLine> {
    const dto = await this.httpClient.post<TransferOrderLineDto>(
      API_ENDPOINTS.TRANSFER_ORDERS.LINES(transferOrderId).CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id)
      throw new Error("Create transfer order line response missing id");
    return toTransferOrderLine(
      transferOrderId,
      dto as TransferOrderLineDto & { id: string },
    );
  }

  async update(
    transferOrderId: string,
    id: string,
    data: TransferOrderLineWriteDto,
  ): Promise<TransferOrderLine> {
    const dto = await this.httpClient.patch<TransferOrderLineDto>(
      API_ENDPOINTS.TRANSFER_ORDERS.LINES(transferOrderId).UPDATE(id),
      normalizeWritePayload(data),
    );
    return toTransferOrderLine(transferOrderId, {
      ...dto,
      id: dto?.id ?? id,
    } as TransferOrderLineDto & { id: string });
  }

  async delete(transferOrderId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.TRANSFER_ORDERS.LINES(transferOrderId).DELETE(id),
    );
  }
}
