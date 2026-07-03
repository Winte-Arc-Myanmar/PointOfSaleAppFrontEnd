import type {
  WaitlistCreateDto,
  WaitlistDto,
  WaitlistSeatDto,
  WaitlistSeatResultDto,
  WaitlistUpdateDto,
} from "@/core/application/dtos/WaitlistDto";
import { toWaitlistEntry, toWaitlistSeatResult } from "@/core/application/mappers/WaitlistMapper";
import type { WaitlistEntry, WaitlistSeatResult } from "@/core/domain/entities/Waitlist";
import type { GetWaitlistParams, IWaitlistRepository } from "@/core/domain/repositories/IWaitlistRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "@/core/infrastructure/api/parsePaginatedResponse";

export class ApiWaitlistRepository implements IWaitlistRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetWaitlistParams): Promise<PaginatedResult<WaitlistEntry>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.WAITLIST.LIST, {
      params: {
        page,
        limit,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.locationId ? { locationId: params.locationId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.activeOnly !== undefined ? { activeOnly: params.activeOnly } : {}),
      },
    });
    const parsed = parsePaginatedResponse<WaitlistDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toWaitlistEntry(dto as WaitlistDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<WaitlistEntry | null> {
    try {
      const dto = await this.httpClient.get<WaitlistDto>(API_ENDPOINTS.WAITLIST.BY_ID(id));
      if (!dto?.id) return null;
      return toWaitlistEntry(dto as WaitlistDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: WaitlistCreateDto): Promise<WaitlistEntry> {
    const dto = await this.httpClient.post<WaitlistDto>(API_ENDPOINTS.WAITLIST.CREATE, data);
    if (!dto?.id) throw new Error("Create waitlist response missing id");
    return toWaitlistEntry(dto as WaitlistDto & { id: string });
  }

  async update(id: string, data: WaitlistUpdateDto): Promise<WaitlistEntry> {
    const dto = await this.httpClient.patch<WaitlistDto>(API_ENDPOINTS.WAITLIST.UPDATE(id), data);
    return toWaitlistEntry({ ...dto, id: dto?.id ?? id } as WaitlistDto & { id: string });
  }

  async notify(id: string): Promise<WaitlistEntry> {
    const dto = await this.httpClient.post<WaitlistDto>(API_ENDPOINTS.WAITLIST.NOTIFY(id));
    return toWaitlistEntry({ ...dto, id: dto?.id ?? id } as WaitlistDto & { id: string });
  }

  async seat(id: string, data: WaitlistSeatDto): Promise<WaitlistSeatResult> {
    const dto = await this.httpClient.post<WaitlistSeatResultDto>(API_ENDPOINTS.WAITLIST.SEAT(id), data);
    return toWaitlistSeatResult(dto);
  }

  async cancel(id: string): Promise<WaitlistEntry> {
    const dto = await this.httpClient.post<WaitlistDto>(API_ENDPOINTS.WAITLIST.CANCEL(id));
    return toWaitlistEntry({ ...dto, id: dto?.id ?? id } as WaitlistDto & { id: string });
  }

  async noShow(id: string): Promise<WaitlistEntry> {
    const dto = await this.httpClient.post<WaitlistDto>(API_ENDPOINTS.WAITLIST.NO_SHOW(id));
    return toWaitlistEntry({ ...dto, id: dto?.id ?? id } as WaitlistDto & { id: string });
  }
}
