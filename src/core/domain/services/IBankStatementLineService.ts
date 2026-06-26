import type { BankStatementLine } from "../entities/BankStatementLine";
import type {
  GetBankStatementLinesParams,
  BankStatementLineWriteDto,
} from "../repositories/IBankStatementLineRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IBankStatementLineService {
  getAll(
    bankStatementId: string,
    params?: GetBankStatementLinesParams
  ): Promise<PaginatedResult<BankStatementLine>>;
  getById(bankStatementId: string, id: string): Promise<BankStatementLine | null>;
  create(
    bankStatementId: string,
    data: BankStatementLineWriteDto
  ): Promise<BankStatementLine>;
  update(
    bankStatementId: string,
    id: string,
    data: BankStatementLineWriteDto
  ): Promise<BankStatementLine>;
  delete(bankStatementId: string, id: string): Promise<void>;
}
