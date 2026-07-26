import type {
  IGrnLineRepository,
  GetGrnLinesParams,
  GrnLineWriteDto,
} from "@/core/domain/repositories/IGrnLineRepository";
import type { GrnLine } from "@/core/domain/entities/GrnLine";
import type { GrnLineDto } from "@/core/application/dtos/GrnLineDto";
import { toGrnLine } from "@/core/application/mappers/GrnLineMapper";
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

function normalizeWritePayload(data: GrnLineWriteDto): Record<string, unknown> {
  return {
    poLineId: data.poLineId,
    productId: data.productId,
    receivedQuantity: toApiDecimalStringFixed4(data.receivedQuantity),
    acceptedQuantity: toApiDecimalStringFixed4(data.acceptedQuantity),
    rejectedQuantity: toApiDecimalStringFixed4(data.rejectedQuantity),
    inventoryLedgerPosted: Boolean(data.inventoryLedgerPosted),
  };
}

export class ApiGrnLineRepository implements IGrnLineRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    grnId: string,
    params?: GetGrnLinesParams,
  ): Promise<PaginatedResult<GrnLine>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.LINES(grnId).LIST,
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
    const parsed = parsePaginatedResponse<GrnLineDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toGrnLine(grnId, dto as GrnLineDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(grnId: string, id: string): Promise<GrnLine | null> {
    try {
      const dto = await this.httpClient.get<GrnLineDto>(
        API_ENDPOINTS.GOODS_RECEIVED_NOTES.LINES(grnId).BY_ID(id),
      );
      if (!dto?.id) return null;
      return toGrnLine(grnId, dto as GrnLineDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(grnId: string, data: GrnLineWriteDto): Promise<GrnLine> {
    const dto = await this.httpClient.post<GrnLineDto>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.LINES(grnId).CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id) throw new Error("Create GRN line response missing id");
    return toGrnLine(grnId, dto as GrnLineDto & { id: string });
  }

  async update(
    grnId: string,
    id: string,
    data: GrnLineWriteDto,
  ): Promise<GrnLine> {
    const dto = await this.httpClient.patch<GrnLineDto>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.LINES(grnId).UPDATE(id),
      normalizeWritePayload(data),
    );
    return toGrnLine(grnId, {
      ...dto,
      id: dto?.id ?? id,
    } as GrnLineDto & { id: string });
  }

  async delete(grnId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.LINES(grnId).DELETE(id),
    );
  }
}
