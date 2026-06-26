import type { IReconciliationMatchService } from "@/core/domain/services/IReconciliationMatchService";
import type { IReconciliationMatchRepository } from "@/core/domain/repositories/IReconciliationMatchRepository";
import type { ReconciliationMatch } from "@/core/domain/entities/ReconciliationMatch";
import type {
  GetReconciliationMatchesParams,
  ReconciliationMatchWriteDto,
} from "@/core/domain/repositories/IReconciliationMatchRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class ReconciliationMatchService implements IReconciliationMatchService {
  constructor(
    private readonly reconciliationMatchRepository: IReconciliationMatchRepository
  ) {}

  getAll(
    params?: GetReconciliationMatchesParams
  ): Promise<PaginatedResult<ReconciliationMatch>> {
    return this.reconciliationMatchRepository.getAll(params);
  }

  getById(id: string): Promise<ReconciliationMatch | null> {
    return this.reconciliationMatchRepository.getById(id);
  }

  create(data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch> {
    return this.reconciliationMatchRepository.create(data);
  }

  update(id: string, data: ReconciliationMatchWriteDto): Promise<ReconciliationMatch> {
    return this.reconciliationMatchRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.reconciliationMatchRepository.delete(id);
  }
}
