import type { PosSession } from "../entities/PosSession";
import type { PosSessionDto, ClosePosSessionRequestDto } from "@/core/application/dtos/PosSessionDto";
import type { PosSessionSummary } from "../entities/PosSessionSummary";

export interface GetPosSessionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IPosSessionRepository {
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

