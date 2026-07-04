import type { WaitlistStatus } from "@/core/domain/entities/Waitlist";
import type { TableSessionDto } from "@/core/application/dtos/TableSessionDto";

export interface WaitlistDto {
  id?: string;
  tenantId: string;
  locationId: string;
  customerId?: string | null;
  guestName: string;
  guestPhone?: string | null;
  partySize: number;
  joinedAt?: string | null;
  estimatedWaitMins?: number | null;
  preferredZoneId?: string | null;
  assignedTableId?: string | null;
  tableSessionId?: string | null;
  notifiedAt?: string | null;
  seatedAt?: string | null;
  canceledAt?: string | null;
  notes?: string | null;
  status: WaitlistStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type WaitlistCreateDto = Pick<
  WaitlistDto,
  | "tenantId"
  | "locationId"
  | "customerId"
  | "guestName"
  | "guestPhone"
  | "partySize"
  | "estimatedWaitMins"
  | "preferredZoneId"
  | "notes"
>;

export type WaitlistUpdateDto = Pick<
  WaitlistDto,
  | "locationId"
  | "customerId"
  | "guestName"
  | "guestPhone"
  | "partySize"
  | "estimatedWaitMins"
  | "preferredZoneId"
  | "notes"
>;

export interface WaitlistSeatDto {
  tableId: string;
  waiterId: string;
  guestCount: number;
  posRegisterId: string;
  openedByPosSessionId: string;
}

export interface WaitlistSeatResultDto {
  waitlist: WaitlistDto;
  tableSession: TableSessionDto;
}
