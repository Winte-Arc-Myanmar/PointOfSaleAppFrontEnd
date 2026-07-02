import type { KdsFireDto, KdsTicketDto, KdsTicketLineDto } from "@/core/application/dtos/KdsTicketDto";
import { toKdsTicket, toKdsTicketLine } from "@/core/application/mappers/KdsTicketMapper";
import type { KdsTicket, KdsTicketLine } from "@/core/domain/entities/KdsTicket";
import type { GetKdsTicketsParams, IKdsTicketRepository } from "@/core/domain/repositories/IKdsTicketRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "@/core/infrastructure/api/parsePaginatedResponse";

export class ApiKdsTicketRepository implements IKdsTicketRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async firePendingLines(data: KdsFireDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.KDS.FIRE, data);
  }

  async getAll(params?: GetKdsTicketsParams): Promise<PaginatedResult<KdsTicket>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.KDS.TICKETS.LIST, {
      params: {
        page,
        limit,
        ...(params?.stationId ? { stationId: params.stationId } : {}),
        ...(params?.sessionId ? { sessionId: params.sessionId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.activeOnly !== undefined ? { activeOnly: params.activeOnly } : {}),
      },
    });
    const parsed = parsePaginatedResponse<KdsTicketDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toKdsTicket(dto as KdsTicketDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<KdsTicket | null> {
    try {
      const dto = await this.httpClient.get<KdsTicketDto>(API_ENDPOINTS.KDS.TICKETS.BY_ID(id));
      if (!dto?.id) return null;
      return toKdsTicket(dto as KdsTicketDto & { id: string });
    } catch {
      return null;
    }
  }

  async start(id: string): Promise<KdsTicket> {
    const dto = await this.httpClient.post<KdsTicketDto>(API_ENDPOINTS.KDS.TICKETS.START(id));
    return toKdsTicket({ ...dto, id: dto?.id ?? id } as KdsTicketDto & { id: string });
  }

  async ready(id: string): Promise<KdsTicket> {
    const dto = await this.httpClient.post<KdsTicketDto>(API_ENDPOINTS.KDS.TICKETS.READY(id));
    return toKdsTicket({ ...dto, id: dto?.id ?? id } as KdsTicketDto & { id: string });
  }

  async recall(id: string): Promise<KdsTicket> {
    const dto = await this.httpClient.post<KdsTicketDto>(API_ENDPOINTS.KDS.TICKETS.RECALL(id));
    return toKdsTicket({ ...dto, id: dto?.id ?? id } as KdsTicketDto & { id: string });
  }

  async expedite(id: string): Promise<KdsTicket> {
    const dto = await this.httpClient.post<KdsTicketDto>(API_ENDPOINTS.KDS.TICKETS.EXPEDITE(id));
    return toKdsTicket({ ...dto, id: dto?.id ?? id } as KdsTicketDto & { id: string });
  }

  async readyLine(lineId: string): Promise<KdsTicketLine> {
    const dto = await this.httpClient.post<KdsTicketLineDto>(API_ENDPOINTS.KDS.TICKETS.LINE_READY(lineId));
    return toKdsTicketLine({
      ...dto,
      id: dto?.id ?? lineId,
    } as KdsTicketLineDto & { id: string });
  }
}
