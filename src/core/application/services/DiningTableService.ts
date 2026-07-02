import type { IDiningTableService } from "@/core/domain/services/IDiningTableService";
import type { IDiningTableRepository } from "@/core/domain/repositories/IDiningTableRepository";
import type { DiningTable, DiningTableStatus } from "@/core/domain/entities/DiningTable";
import type { GetDiningTablesParams } from "@/core/domain/repositories/IDiningTableRepository";
import type {
  DiningTableCreateDto,
  DiningTableUpdateDto,
} from "../dtos/DiningTableDto";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class DiningTableService implements IDiningTableService {
  constructor(private readonly diningTableRepository: IDiningTableRepository) {}

  getAll(params?: GetDiningTablesParams): Promise<PaginatedResult<DiningTable>> {
    return this.diningTableRepository.getAll(params);
  }

  getById(id: string): Promise<DiningTable | null> {
    return this.diningTableRepository.getById(id);
  }

  create(data: DiningTableCreateDto): Promise<DiningTable> {
    return this.diningTableRepository.create(data);
  }

  update(id: string, data: DiningTableUpdateDto): Promise<DiningTable> {
    return this.diningTableRepository.update(id, data);
  }

  updateStatus(id: string, status: DiningTableStatus): Promise<DiningTable> {
    return this.diningTableRepository.updateStatus(id, status);
  }

  delete(id: string): Promise<void> {
    return this.diningTableRepository.delete(id);
  }
}
