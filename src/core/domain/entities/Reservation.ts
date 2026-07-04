import type { Id } from "@/core/domain/types";
import type { TableSession } from "@/core/domain/entities/TableSession";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "NO_SHOW"
  | "CANCELED"
  | "COMPLETED"
  | string;

export interface Reservation {
  id: Id;
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

export interface ReservationSeatResult {
  reservation: Reservation;
  tableSession: TableSession;
}
