import type { DiningTable, DiningTableStatus } from "../entities/DiningTable";
import type {
  DiningTableCreateDto,
  DiningTableUpdateDto,
} from "@/core/application/dtos/DiningTableDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetDiningTablesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  zoneId?: string;
  status?: DiningTableStatus;
}

export interface IDiningTableRepository {
  getAll(params?: GetDiningTablesParams): Promise<PaginatedResult<DiningTable>>;
  getById(id: string): Promise<DiningTable | null>;
  create(data: DiningTableCreateDto): Promise<DiningTable>;
  update(id: string, data: DiningTableUpdateDto): Promise<DiningTable>;
  updateStatus(id: string, status: DiningTableStatus): Promise<DiningTable>;
  delete(id: string): Promise<void>;
}
