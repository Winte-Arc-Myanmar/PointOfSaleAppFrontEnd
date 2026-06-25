import type { BankStatement } from "../entities/BankStatement";
import type {
  GetBankStatementsParams,
  BankStatementWriteDto,
} from "../repositories/IBankStatementRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IBankStatementService {
  getAll(params?: GetBankStatementsParams): Promise<PaginatedResult<BankStatement>>;
  getById(id: string): Promise<BankStatement | null>;
  create(data: BankStatementWriteDto): Promise<BankStatement>;
  update(id: string, data: BankStatementWriteDto): Promise<BankStatement>;
  delete(id: string): Promise<void>;
}
