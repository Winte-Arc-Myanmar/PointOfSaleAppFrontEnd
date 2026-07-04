import type {
  ReservationCreateDto,
  ReservationSeatDto,
  ReservationUpdateDto,
} from "@/core/application/dtos/ReservationDto";
import type { Reservation, ReservationSeatResult } from "@/core/domain/entities/Reservation";
import type {
  GetReservationsParams,
  IReservationRepository,
} from "@/core/domain/repositories/IReservationRepository";
import type { IReservationService } from "@/core/domain/services/IReservationService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class ReservationService implements IReservationService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  getAll(params?: GetReservationsParams): Promise<PaginatedResult<Reservation>> {
    return this.reservationRepository.getAll(params);
  }

  getById(id: string): Promise<Reservation | null> {
    return this.reservationRepository.getById(id);
  }

  create(data: ReservationCreateDto): Promise<Reservation> {
    return this.reservationRepository.create(data);
  }

  update(id: string, data: ReservationUpdateDto): Promise<Reservation> {
    return this.reservationRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.reservationRepository.delete(id);
  }

  confirm(id: string): Promise<Reservation> {
    return this.reservationRepository.confirm(id);
  }

  seat(id: string, data: ReservationSeatDto): Promise<ReservationSeatResult> {
    return this.reservationRepository.seat(id, data);
  }

  cancel(id: string): Promise<Reservation> {
    return this.reservationRepository.cancel(id);
  }

  noShow(id: string): Promise<Reservation> {
    return this.reservationRepository.noShow(id);
  }
}
