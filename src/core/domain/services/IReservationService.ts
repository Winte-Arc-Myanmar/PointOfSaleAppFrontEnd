import type {
  ReservationCreateDto,
  ReservationSeatDto,
  ReservationUpdateDto,
} from "@/core/application/dtos/ReservationDto";
import type { GetReservationsParams } from "@/core/domain/repositories/IReservationRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { Reservation, ReservationSeatResult } from "@/core/domain/entities/Reservation";

export interface IReservationService {
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
