import type { IBankStatementLineService } from "@/core/domain/services/IBankStatementLineService";
import type { IBankStatementLineRepository } from "@/core/domain/repositories/IBankStatementLineRepository";
import type { BankStatementLine } from "@/core/domain/entities/BankStatementLine";
import type {
  GetBankStatementLinesParams,
  BankStatementLineWriteDto,
} from "@/core/domain/repositories/IBankStatementLineRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class BankStatementLineService implements IBankStatementLineService {
  constructor(private readonly bankStatementLineRepository: IBankStatementLineRepository) {}

  getAll(
    bankStatementId: string,
    params?: GetBankStatementLinesParams
  ): Promise<PaginatedResult<BankStatementLine>> {
    return this.bankStatementLineRepository.getAll(bankStatementId, params);
  }

  getById(bankStatementId: string, id: string): Promise<BankStatementLine | null> {
    return this.bankStatementLineRepository.getById(bankStatementId, id);
  }

  create(
    bankStatementId: string,
    data: BankStatementLineWriteDto
  ): Promise<BankStatementLine> {
    return this.bankStatementLineRepository.create(bankStatementId, data);
  }

  update(
    bankStatementId: string,
    id: string,
    data: BankStatementLineWriteDto
  ): Promise<BankStatementLine> {
    return this.bankStatementLineRepository.update(bankStatementId, id, data);
  }

  delete(bankStatementId: string, id: string): Promise<void> {
    return this.bankStatementLineRepository.delete(bankStatementId, id);
  }
}
