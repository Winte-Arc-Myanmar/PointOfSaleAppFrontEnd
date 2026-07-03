import type { KdsFireDto } from "@/core/application/dtos/KdsTicketDto";
import type { KdsTicket, KdsTicketLine } from "@/core/domain/entities/KdsTicket";
import type { GetKdsTicketsParams, IKdsTicketRepository } from "@/core/domain/repositories/IKdsTicketRepository";
import type { IKdsTicketService } from "@/core/domain/services/IKdsTicketService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class KdsTicketService implements IKdsTicketService {
  constructor(private readonly kdsTicketRepository: IKdsTicketRepository) {}

  firePendingLines(data: KdsFireDto): Promise<void> {
    return this.kdsTicketRepository.firePendingLines(data);
  }

  getAll(params?: GetKdsTicketsParams): Promise<PaginatedResult<KdsTicket>> {
    return this.kdsTicketRepository.getAll(params);
  }

  getById(id: string): Promise<KdsTicket | null> {
    return this.kdsTicketRepository.getById(id);
  }

  start(id: string): Promise<KdsTicket> {
    return this.kdsTicketRepository.start(id);
  }

  ready(id: string): Promise<KdsTicket> {
    return this.kdsTicketRepository.ready(id);
  }

  recall(id: string): Promise<KdsTicket> {
    return this.kdsTicketRepository.recall(id);
  }

  expedite(id: string): Promise<KdsTicket> {
    return this.kdsTicketRepository.expedite(id);
  }

  readyLine(lineId: string): Promise<KdsTicketLine> {
    return this.kdsTicketRepository.readyLine(lineId);
  }
}
