import type { Id } from "@/core/domain/types";

export type TableSessionState =
  | "SEATED"
  | "ORDERING"
  | "SERVED"
  | "PAYMENT_PENDING"
  | "CLOSED"
  | string;

export interface TableSession {
  id: Id;
  tenantId: string;
  tableId: string;
  locationId?: string;
  waiterId: string;
  guestCount: number;
  openedAt?: string | null;
  closedAt?: string | null;
  salesOrderId?: string | null;
  sessionState: TableSessionState;
  posRegisterId?: string | null;
  openedByPosSessionId?: string | null;
}

export interface TableSessionSeatAllocation {
  id: Id;
  sessionId: string;
  salesOrderLineId: string;
  seatNumber: number;
}
