import type { ReconciliationMatch } from "../entities/ReconciliationMatch";
import type { ReconciliationMatchDto } from "@/core/application/dtos/ReconciliationMatchDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetReconciliationMatchesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type ReconciliationMatchWriteDto = Omit<
  ReconciliationMatchDto,
  "id" | "matchedAt"
>;

export interface IReconciliationMatchRepository {
  getAll(
    params?: GetReconciliationMatchesParams
  ): Promise<PaginatedResult<ReconciliationMatch>>;
  getById(id: string): Promise<ReconciliationMatch | null>;
  create(data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch>;
  update(id: string, data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch>;
  delete(id: string): Promise<void>;
}
