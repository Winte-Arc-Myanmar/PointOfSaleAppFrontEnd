import type { KdsFireDto } from "@/core/application/dtos/KdsTicketDto";
import type { KdsTicket, KdsTicketLine, KdsTicketStatus } from "@/core/domain/entities/KdsTicket";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface GetKdsTicketsParams {
  page?: number;
  limit?: number;
  stationId?: string;
  sessionId?: string;
  status?: KdsTicketStatus;
  activeOnly?: boolean;
}

export interface IKdsTicketRepository {
  firePendingLines(data: KdsFireDto): Promise<void>;
  getAll(params?: GetKdsTicketsParams): Promise<PaginatedResult<KdsTicket>>;
  getById(id: string): Promise<KdsTicket | null>;
  start(id: string): Promise<KdsTicket>;
  ready(id: string): Promise<KdsTicket>;
  recall(id: string): Promise<KdsTicket>;
  expedite(id: string): Promise<KdsTicket>;
  readyLine(lineId: string): Promise<KdsTicketLine>;
}
