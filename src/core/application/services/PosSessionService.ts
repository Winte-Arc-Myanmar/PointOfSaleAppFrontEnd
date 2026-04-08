import type { IPosSessionService } from "@/core/domain/services/IPosSessionService";
import type { IPosSessionRepository } from "@/core/domain/repositories/IPosSessionRepository";
import type { GetPosSessionsParams } from "@/core/domain/repositories/IPosSessionRepository";
import type { PosSession } from "@/core/domain/entities/PosSession";
import type { PosSessionDto, ClosePosSessionRequestDto } from "../dtos/PosSessionDto";
import type { PosSessionSummary } from "@/core/domain/entities/PosSessionSummary";

export class PosSessionService implements IPosSessionService {
  constructor(private readonly posSessionRepository: IPosSessionRepository) {}

  getAll(params?: GetPosSessionsParams): Promise<PosSession[]> {
    return this.posSessionRepository.getAll(params);
  }

  getById(id: string): Promise<PosSession | null> {
    return this.posSessionRepository.getById(id);
  }

  create(data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">): Promise<PosSession> {
    return this.posSessionRepository.create(data);
  }

  update(
    id: string,
    data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">
  ): Promise<PosSession> {
    return this.posSessionRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.posSessionRepository.delete(id);
  }

  close(id: string, data: ClosePosSessionRequestDto): Promise<PosSessionSummary> {
    return this.posSessionRepository.close(id, data);
  }

  getSummary(id: string): Promise<PosSessionSummary> {
    return this.posSessionRepository.getSummary(id);
  }
}

