import type {
  IGoodsReceivedNoteRepository,
  GetGoodsReceivedNotesParams,
  GoodsReceivedNoteWriteDto,
} from "@/core/domain/repositories/IGoodsReceivedNoteRepository";
import type { GoodsReceivedNote } from "@/core/domain/entities/GoodsReceivedNote";
import type { GoodsReceivedNoteDto } from "@/core/application/dtos/GoodsReceivedNoteDto";
import { toGoodsReceivedNote } from "@/core/application/mappers/GoodsReceivedNoteMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function normalizeWritePayload(
  data: GoodsReceivedNoteWriteDto,
): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    purchaseOrderId: data.purchaseOrderId,
    receivingLocationId: data.receivingLocationId,
    grnNumber: data.grnNumber,
    receivedBy: data.receivedBy,
  };
}

export class ApiGoodsReceivedNoteRepository
  implements IGoodsReceivedNoteRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetGoodsReceivedNotesParams,
  ): Promise<PaginatedResult<GoodsReceivedNote>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.LIST,
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
    const parsed = parsePaginatedResponse<GoodsReceivedNoteDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toGoodsReceivedNote(dto as GoodsReceivedNoteDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<GoodsReceivedNote | null> {
    try {
      const dto = await this.httpClient.get<GoodsReceivedNoteDto>(
        API_ENDPOINTS.GOODS_RECEIVED_NOTES.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toGoodsReceivedNote(dto as GoodsReceivedNoteDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: GoodsReceivedNoteWriteDto,
  ): Promise<GoodsReceivedNote> {
    const dto = await this.httpClient.post<GoodsReceivedNoteDto>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id)
      throw new Error("Create goods received note response missing id");
    return toGoodsReceivedNote(dto as GoodsReceivedNoteDto & { id: string });
  }

  async update(
    id: string,
    data: GoodsReceivedNoteWriteDto,
  ): Promise<GoodsReceivedNote> {
    const dto = await this.httpClient.patch<GoodsReceivedNoteDto>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toGoodsReceivedNote({
      ...dto,
      id: dto?.id ?? id,
    } as GoodsReceivedNoteDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.GOODS_RECEIVED_NOTES.DELETE(id));
  }
}
