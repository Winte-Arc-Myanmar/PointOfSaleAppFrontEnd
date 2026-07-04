import type { Id } from "@/core/domain/types";
import type { TableSession } from "@/core/domain/entities/TableSession";

export type WaitlistStatus =
  | "WAITING"
  | "NOTIFIED"
  | "SEATED"
  | "CANCELED"
  | "NO_SHOW"
  | string;

export interface WaitlistEntry {
  id: Id;
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

export interface WaitlistSeatResult {
  waitlist: WaitlistEntry;
  tableSession: TableSession;
}
