import type {
  ReservationCreateDto,
  ReservationDto,
  ReservationSeatDto,
  ReservationSeatResultDto,
  ReservationUpdateDto,
} from "@/core/application/dtos/ReservationDto";
import { toReservation, toReservationSeatResult } from "@/core/application/mappers/ReservationMapper";
import type { Reservation, ReservationSeatResult } from "@/core/domain/entities/Reservation";
import type {
  GetReservationsParams,
  IReservationRepository,
} from "@/core/domain/repositories/IReservationRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "@/core/infrastructure/api/parsePaginatedResponse";

export class ApiReservationRepository implements IReservationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetReservationsParams): Promise<PaginatedResult<Reservation>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.RESERVATIONS.LIST, {
      params: {
        page,
        limit,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.locationId ? { locationId: params.locationId } : {}),
        ...(params?.customerId ? { customerId: params.customerId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params?.toDate ? { toDate: params.toDate } : {}),
        ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
        ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
      },
    });
    const parsed = parsePaginatedResponse<ReservationDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toReservation(dto as ReservationDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<Reservation | null> {
    try {
      const dto = await this.httpClient.get<ReservationDto>(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
      if (!dto?.id) return null;
      return toReservation(dto as ReservationDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: ReservationCreateDto): Promise<Reservation> {
    const dto = await this.httpClient.post<ReservationDto>(API_ENDPOINTS.RESERVATIONS.CREATE, data);
    if (!dto?.id) throw new Error("Create reservation response missing id");
    return toReservation(dto as ReservationDto & { id: string });
  }

  async update(id: string, data: ReservationUpdateDto): Promise<Reservation> {
    const dto = await this.httpClient.patch<ReservationDto>(API_ENDPOINTS.RESERVATIONS.UPDATE(id), data);
    return toReservation({ ...dto, id: dto?.id ?? id } as ReservationDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.RESERVATIONS.DELETE(id));
  }

  async confirm(id: string): Promise<Reservation> {
    const dto = await this.httpClient.post<ReservationDto>(API_ENDPOINTS.RESERVATIONS.CONFIRM(id));
    return toReservation({ ...dto, id: dto?.id ?? id } as ReservationDto & { id: string });
  }

  async seat(id: string, data: ReservationSeatDto): Promise<ReservationSeatResult> {
    const dto = await this.httpClient.post<ReservationSeatResultDto>(
      API_ENDPOINTS.RESERVATIONS.SEAT(id),
      data,
    );
    return toReservationSeatResult(dto);
  }

  async cancel(id: string): Promise<Reservation> {
    const dto = await this.httpClient.post<ReservationDto>(API_ENDPOINTS.RESERVATIONS.CANCEL(id));
    return toReservation({ ...dto, id: dto?.id ?? id } as ReservationDto & { id: string });
  }

  async noShow(id: string): Promise<Reservation> {
    const dto = await this.httpClient.post<ReservationDto>(API_ENDPOINTS.RESERVATIONS.NO_SHOW(id));
    return toReservation({ ...dto, id: dto?.id ?? id } as ReservationDto & { id: string });
  }
}
