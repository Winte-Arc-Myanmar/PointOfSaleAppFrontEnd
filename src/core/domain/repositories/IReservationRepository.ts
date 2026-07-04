import type {
  ReservationCreateDto,
  ReservationSeatDto,
  ReservationUpdateDto,
} from "@/core/application/dtos/ReservationDto";
import type {
  Reservation,
  ReservationSeatResult,
  ReservationStatus,
} from "@/core/domain/entities/Reservation";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface GetReservationsParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  customerId?: string;
  status?: ReservationStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IReservationRepository {
  getAll(params?: GetReservationsParams): Promise<PaginatedResult<Reservation>>;
  getById(id: string): Promise<Reservation | null>;
  create(data: ReservationCreateDto): Promise<Reservation>;
  update(id: string, data: ReservationUpdateDto): Promise<Reservation>;
  delete(id: string): Promise<void>;
  confirm(id: string): Promise<Reservation>;
  seat(id: string, data: ReservationSeatDto): Promise<ReservationSeatResult>;
  cancel(id: string): Promise<Reservation>;
  noShow(id: string): Promise<Reservation>;
}
