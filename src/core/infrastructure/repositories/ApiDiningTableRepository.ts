import type {
  IDiningTableRepository,
  GetDiningTablesParams,
} from "@/core/domain/repositories/IDiningTableRepository";
import type { DiningTable, DiningTableStatus } from "@/core/domain/entities/DiningTable";
import type {
  DiningTableDto,
  DiningTableCreateDto,
  DiningTableUpdateDto,
} from "@/core/application/dtos/DiningTableDto";
import { toDiningTable } from "@/core/application/mappers/DiningTableMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function normalizeWritePayload(
  data: DiningTableCreateDto | DiningTableUpdateDto
): Record<string, unknown> {
  return {
    zoneId: data.zoneId,
    tableNumber: data.tableNumber,
    maxSeats: data.maxSeats,
    posX: data.posX,
    posY: data.posY,
    shape: data.shape,
    status: data.status,
  };
}

function normalizeCreatePayload(data: DiningTableCreateDto): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    ...normalizeWritePayload(data),
  };
}

export class ApiDiningTableRepository implements IDiningTableRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetDiningTablesParams): Promise<PaginatedResult<DiningTable>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.DINING_TABLES.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
          ...(params?.zoneId ? { zoneId: params.zoneId } : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      }
    );
    const parsed = parsePaginatedResponse<DiningTableDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toDiningTable(dto as DiningTableDto & { id: string }),
      (dto) => !!dto?.id
    );
  }

  async getById(id: string): Promise<DiningTable | null> {
    try {
      const dto = await this.httpClient.get<DiningTableDto>(
        API_ENDPOINTS.DINING_TABLES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toDiningTable(dto as DiningTableDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: DiningTableCreateDto): Promise<DiningTable> {
    const dto = await this.httpClient.post<DiningTableDto>(
      API_ENDPOINTS.DINING_TABLES.CREATE,
      normalizeCreatePayload(data)
    );
    if (!dto?.id) throw new Error("Create dining table response missing id");
    return toDiningTable(dto as DiningTableDto & { id: string });
  }

  async update(id: string, data: DiningTableUpdateDto): Promise<DiningTable> {
    const dto = await this.httpClient.patch<DiningTableDto>(
      API_ENDPOINTS.DINING_TABLES.UPDATE(id),
      normalizeWritePayload(data)
    );
    return toDiningTable({ ...dto, id: dto?.id ?? id } as DiningTableDto & { id: string });
  }

  async updateStatus(id: string, status: DiningTableStatus): Promise<DiningTable> {
    const dto = await this.httpClient.patch<DiningTableDto>(
      API_ENDPOINTS.DINING_TABLES.UPDATE_STATUS(id),
      { status }
    );
    return toDiningTable({ ...dto, id: dto?.id ?? id } as DiningTableDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.DINING_TABLES.DELETE(id));
  }
}
