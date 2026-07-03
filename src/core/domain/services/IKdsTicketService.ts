import type { KdsFireDto } from "@/core/application/dtos/KdsTicketDto";
import type { KdsTicket, KdsTicketLine } from "@/core/domain/entities/KdsTicket";
import type { GetKdsTicketsParams } from "@/core/domain/repositories/IKdsTicketRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface IKdsTicketService {
  firePendingLines(data: KdsFireDto): Promise<void>;
  getAll(params?: GetKdsTicketsParams): Promise<PaginatedResult<KdsTicket>>;
  getById(id: string): Promise<KdsTicket | null>;
  start(id: string): Promise<KdsTicket>;
  ready(id: string): Promise<KdsTicket>;
  recall(id: string): Promise<KdsTicket>;
  expedite(id: string): Promise<KdsTicket>;
  readyLine(lineId: string): Promise<KdsTicketLine>;
}
