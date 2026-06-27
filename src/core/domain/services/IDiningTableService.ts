import type { DiningTable, DiningTableStatus } from "../entities/DiningTable";
import type { GetDiningTablesParams } from "../repositories/IDiningTableRepository";
import type {
  DiningTableCreateDto,
  DiningTableUpdateDto,
} from "@/core/application/dtos/DiningTableDto";
import type { PaginatedResult } from "../types/pagination";

export interface IDiningTableService {
  getAll(params?: GetDiningTablesParams): Promise<PaginatedResult<DiningTable>>;
  getById(id: string): Promise<DiningTable | null>;
  create(data: DiningTableCreateDto): Promise<DiningTable>;
  update(id: string, data: DiningTableUpdateDto): Promise<DiningTable>;
  updateStatus(id: string, status: DiningTableStatus): Promise<DiningTable>;
  delete(id: string): Promise<void>;
}
