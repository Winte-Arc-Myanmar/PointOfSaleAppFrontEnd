import type { Id } from "@/core/domain/types";

export type KdsTicketStatus = "PENDING" | "PREPARING" | "READY" | "EXPEDITED" | string;

export interface KdsTicket {
  id: Id;
  tenantId: string;
  sessionId?: string | null;
  salesOrderId?: string | null;
  stationId: string;
  stationName?: string | null;
  /** Where the order goes: "Table T12", "VIP Lounge K3", "Counter". */
  placeLabel?: string | null;
  ticketNumber: string;
  courseType?: string | null;
  firedAt?: string | null;
  startedAt?: string | null;
  bumpedAt?: string | null;
  status: KdsTicketStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface KdsTicketLine {
  id: Id;
  ticketId: string;
  salesOrderLineId: string;
  productName: string;
  quantity: string;
  seatNumber?: number | null;
  kitchenModifiers?: string | null;
  status: KdsTicketStatus;
  bumpedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
