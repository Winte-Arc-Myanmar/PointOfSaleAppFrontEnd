import type {
  GetCardTiersParams,
  ICardTierRepository,
} from "@/core/domain/repositories/ICardTierRepository";
import type { CardTier } from "@/core/domain/entities/CardTier";
import type { CardTierDto, CardTierWriteDto } from "@/core/application/dtos/CardTierDto";
import { toCardTier } from "@/core/application/mappers/CardTierMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function extractCardTierDto(raw: unknown): (CardTierDto & { id: string }) | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as CardTierDto & { data?: CardTierDto };
  if (record.id) return record as CardTierDto & { id: string };
  if (record.data?.id) return record.data as CardTierDto & { id: string };
  return null;
}

export class ApiCardTierRepository implements ICardTierRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetCardTiersParams): Promise<PaginatedResult<CardTier>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.CARD_TIERS.LIST,
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
    const parsed = parsePaginatedResponse<CardTierDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toCardTier(dto as CardTierDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<CardTier | null> {
    try {
      const response = await this.httpClient.get<unknown>(
        API_ENDPOINTS.CARD_TIERS.BY_ID(id),
      );
      const dto = extractCardTierDto(response);
      if (!dto?.id) return null;
      return toCardTier(dto);
    } catch {
      return null;
    }
  }

  async create(data: CardTierWriteDto): Promise<CardTier> {
    const response = await this.httpClient.post<unknown>(
      API_ENDPOINTS.CARD_TIERS.CREATE,
      data,
    );
    const dto = extractCardTierDto(response);
    if (!dto?.id) throw new Error("Create card tier response missing id");
    return toCardTier(dto);
  }

  async update(id: string, data: CardTierWriteDto): Promise<CardTier> {
    const response = await this.httpClient.patch<unknown>(
      API_ENDPOINTS.CARD_TIERS.UPDATE(id),
      data,
    );
    const dto = extractCardTierDto(response);
    if (!dto?.id) {
      throw new Error("Update card tier response missing id");
    }
    return toCardTier({ ...dto, id: dto.id ?? id });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.CARD_TIERS.DELETE(id));
  }
}
