import type { GrnLine } from "../entities/GrnLine";
import type { GrnLineDto } from "@/core/application/dtos/GrnLineDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetGrnLinesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type GrnLineWriteDto = Omit<
  GrnLineDto,
  "id" | "grnId" | "createdAt" | "updatedAt"
>;

export interface IGrnLineRepository {
  getAll(
    grnId: string,
    params?: GetGrnLinesParams,
  ): Promise<PaginatedResult<GrnLine>>;
  getById(grnId: string, id: string): Promise<GrnLine | null>;
  create(grnId: string, data: GrnLineWriteDto): Promise<GrnLine>;
  update(grnId: string, id: string, data: GrnLineWriteDto): Promise<GrnLine>;
  delete(grnId: string, id: string): Promise<void>;
}
