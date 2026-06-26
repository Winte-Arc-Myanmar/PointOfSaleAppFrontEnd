import type {
  IReconciliationMatchRepository,
  GetReconciliationMatchesParams,
  ReconciliationMatchWriteDto,
} from "@/core/domain/repositories/IReconciliationMatchRepository";
import type { ReconciliationMatch } from "@/core/domain/entities/ReconciliationMatch";
import type { ReconciliationMatchDto } from "@/core/application/dtos/ReconciliationMatchDto";
import { toReconciliationMatch } from "@/core/application/mappers/ReconciliationMatchMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiReconciliationMatchRepository implements IReconciliationMatchRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetReconciliationMatchesParams
  ): Promise<PaginatedResult<ReconciliationMatch>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.RECONCILIATION_MATCHES.LIST,
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
    const parsed = parsePaginatedResponse<ReconciliationMatchDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toReconciliationMatch(dto as ReconciliationMatchDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<ReconciliationMatch | null> {
    try {
      const dto = await this.httpClient.get<ReconciliationMatchDto>(
        API_ENDPOINTS.RECONCILIATION_MATCHES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toReconciliationMatch(dto as ReconciliationMatchDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch> {
    const dto = await this.httpClient.post<ReconciliationMatchDto>(
      API_ENDPOINTS.RECONCILIATION_MATCHES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create reconciliation match response missing id");
    return toReconciliationMatch(dto as ReconciliationMatchDto & { id: string });
  }

  async update(
    id: string,
    data: ReconciliationMatchWriteDto
  ): Promise<ReconciliationMatch> {
    const dto = await this.httpClient.patch<ReconciliationMatchDto>(
      API_ENDPOINTS.RECONCILIATION_MATCHES.UPDATE(id),
      data
    );
    return toReconciliationMatch(
      { ...dto, id: dto?.id ?? id } as ReconciliationMatchDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.RECONCILIATION_MATCHES.DELETE(id));
  }
}
