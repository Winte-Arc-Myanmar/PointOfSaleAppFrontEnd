import type { IBankStatementService } from "@/core/domain/services/IBankStatementService";
import type { IBankStatementRepository } from "@/core/domain/repositories/IBankStatementRepository";
import type { BankStatement } from "@/core/domain/entities/BankStatement";
import type {
  GetBankStatementsParams,
  BankStatementWriteDto,
} from "@/core/domain/repositories/IBankStatementRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class BankStatementService implements IBankStatementService {
  constructor(private readonly bankStatementRepository: IBankStatementRepository) {}

  getAll(params?: GetBankStatementsParams): Promise<PaginatedResult<BankStatement>> {
    return this.bankStatementRepository.getAll(params);
  }

  getById(id: string): Promise<BankStatement | null> {
    return this.bankStatementRepository.getById(id);
  }

  create(data: BankStatementWriteDto): Promise<BankStatement> {
    return this.bankStatementRepository.create(data);
  }

  update(id: string, data: BankStatementWriteDto): Promise<BankStatement> {
    return this.bankStatementRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.bankStatementRepository.delete(id);
  }
}
