import type { KdsTicketStatus } from "@/core/domain/entities/KdsTicket";

export interface KdsFireDto {
  sessionId?: string;
  salesOrderId?: string;
}

export interface KdsTicketDto {
  id?: string;
  tenantId: string;
  sessionId?: string | null;
  salesOrderId?: string | null;
  stationId: string;
  ticketNumber: string;
  courseType?: string | null;
  firedAt?: string | null;
  startedAt?: string | null;
  bumpedAt?: string | null;
  status: KdsTicketStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface KdsTicketLineDto {
  id?: string;
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
