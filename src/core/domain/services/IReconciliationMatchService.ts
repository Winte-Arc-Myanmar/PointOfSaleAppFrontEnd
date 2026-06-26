import type { ReconciliationMatch } from "../entities/ReconciliationMatch";
import type {
  GetReconciliationMatchesParams,
  ReconciliationMatchWriteDto,
} from "../repositories/IReconciliationMatchRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IReconciliationMatchService {
  getAll(
    params?: GetReconciliationMatchesParams
  ): Promise<PaginatedResult<ReconciliationMatch>>;
  getById(id: string): Promise<ReconciliationMatch | null>;
  create(data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch>;
  update(id: string, data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch>;
  delete(id: string): Promise<void>;
}
