import type { ReservationStatus } from "@/core/domain/entities/Reservation";
import type { TableSessionDto } from "@/core/application/dtos/TableSessionDto";

export interface ReservationDto {
  id?: string;
  tenantId: string;
  locationId: string;
  customerId?: string | null;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  partySize: number;
  reservedAt: string;
  estimatedDurationMins?: number | null;
  preferredZoneId?: string | null;
  assignedTableId?: string | null;
  tableSessionId?: string | null;
  specialRequests?: string | null;
  notes?: string | null;
  status: ReservationStatus;
  seatedAt?: string | null;
  canceledAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type ReservationCreateDto = Pick<
  ReservationDto,
  | "tenantId"
  | "locationId"
  | "customerId"
  | "guestName"
  | "guestPhone"
  | "guestEmail"
  | "partySize"
  | "reservedAt"
  | "estimatedDurationMins"
  | "preferredZoneId"
  | "assignedTableId"
  | "specialRequests"
  | "notes"
>;

export type ReservationUpdateDto = Pick<
  ReservationDto,
  | "locationId"
  | "customerId"
  | "guestName"
  | "guestPhone"
  | "guestEmail"
  | "partySize"
  | "reservedAt"
  | "estimatedDurationMins"
  | "preferredZoneId"
  | "assignedTableId"
  | "specialRequests"
  | "notes"
>;

export interface ReservationSeatDto {
  tableId: string;
  waiterId: string;
  guestCount: number;
  posRegisterId: string;
  openedByPosSessionId: string;
}

export interface ReservationSeatResultDto {
  reservation: ReservationDto;
  tableSession: TableSessionDto;
}
