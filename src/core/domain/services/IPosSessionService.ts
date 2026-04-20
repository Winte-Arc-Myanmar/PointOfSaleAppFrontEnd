import type { PosSession } from "../entities/PosSession";
import type { PosSessionDto, ClosePosSessionRequestDto } from "@/core/application/dtos/PosSessionDto";
import type { GetPosSessionsParams } from "../repositories/IPosSessionRepository";
import type { PosSessionSummary } from "../entities/PosSessionSummary";

export interface IPosSessionService {
  getAll(params?: GetPosSessionsParams): Promise<PosSession[]>;
  getById(id: string): Promise<PosSession | null>;
  create(data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">): Promise<PosSession>;
  update(
    id: string,
    data: Omit<PosSessionDto, "id" | "openedAt" | "updatedAt">
  ): Promise<PosSession>;
  delete(id: string): Promise<void>;
  close(id: string, data: ClosePosSessionRequestDto): Promise<PosSessionSummary>;
  getSummary(id: string): Promise<PosSessionSummary>;
}

