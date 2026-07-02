import type {
  GetTableSessionsParams,
  ITableSessionRepository,
} from "@/core/domain/repositories/ITableSessionRepository";
import type {
  TableSession,
  TableSessionSeatAllocation,
} from "@/core/domain/entities/TableSession";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "@/core/infrastructure/api/parsePaginatedResponse";
import type {
  TableSessionAddLineDto,
  TableSessionAllocateSeatDto,
  TableSessionCheckoutDto,
  TableSessionCreateDto,
  TableSessionDto,
  TableSessionSeatAllocationDto,
  TableSessionStateTransitionDto,
  TableSessionUpdateDto,
} from "@/core/application/dtos/TableSessionDto";
import { toTableSession, toTableSessionSeatAllocation } from "@/core/application/mappers/TableSessionMapper";

export class ApiTableSessionRepository implements ITableSessionRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetTableSessionsParams): Promise<PaginatedResult<TableSession>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.TABLE_SESSIONS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.tableId ? { tableId: params.tableId } : {}),
          ...(params?.waiterId ? { waiterId: params.waiterId } : {}),
          ...(params?.sessionState ? { sessionState: params.sessionState } : {}),
          ...(params?.openOnly !== undefined ? { openOnly: params.openOnly } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );

    const parsed = parsePaginatedResponse<TableSessionDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toTableSession(dto as TableSessionDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<TableSession | null> {
    try {
      const dto = await this.httpClient.get<TableSessionDto>(API_ENDPOINTS.TABLE_SESSIONS.BY_ID(id));
      if (!dto?.id) return null;
      return toTableSession(dto as TableSessionDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: TableSessionCreateDto): Promise<TableSession> {
    const dto = await this.httpClient.post<TableSessionDto>(API_ENDPOINTS.TABLE_SESSIONS.CREATE, data);
    if (!dto?.id) throw new Error("Create table session response missing id");
    return toTableSession(dto as TableSessionDto & { id: string });
  }

  async update(id: string, data: TableSessionUpdateDto): Promise<TableSession> {
    const dto = await this.httpClient.patch<TableSessionDto>(API_ENDPOINTS.TABLE_SESSIONS.UPDATE(id), data);
    return toTableSession({ ...dto, id: dto?.id ?? id } as TableSessionDto & { id: string });
  }

  async transitionState(id: string, data: TableSessionStateTransitionDto): Promise<TableSession> {
    const dto = await this.httpClient.post<TableSessionDto>(API_ENDPOINTS.TABLE_SESSIONS.STATE(id), data);
    return toTableSession({ ...dto, id: dto?.id ?? id } as TableSessionDto & { id: string });
  }

  async addLine(id: string, data: TableSessionAddLineDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.TABLE_SESSIONS.LINES(id), data);
  }

  async allocateSeat(id: string, data: TableSessionAllocateSeatDto): Promise<TableSessionSeatAllocation> {
    const dto = await this.httpClient.post<TableSessionSeatAllocationDto>(
      API_ENDPOINTS.TABLE_SESSIONS.SEATS(id),
      data,
    );
    return toTableSessionSeatAllocation({
      ...dto,
      id: dto?.id ?? "",
    } as TableSessionSeatAllocationDto & { id: string });
  }

  async removeSeat(id: string, allocationId: string): Promise<TableSessionSeatAllocation> {
    const dto = await this.httpClient.delete<TableSessionSeatAllocationDto>(
      API_ENDPOINTS.TABLE_SESSIONS.SEATS_BY_ID(id, allocationId),
    );
    return toTableSessionSeatAllocation({
      ...dto,
      id: dto?.id ?? allocationId,
    } as TableSessionSeatAllocationDto & { id: string });
  }

  async checkout(id: string, data: TableSessionCheckoutDto): Promise<TableSession> {
    const dto = await this.httpClient.post<TableSessionDto>(
      API_ENDPOINTS.TABLE_SESSIONS.CHECKOUT(id),
      data,
    );
    return toTableSession({ ...dto, id: dto?.id ?? id } as TableSessionDto & { id: string });
  }
}
