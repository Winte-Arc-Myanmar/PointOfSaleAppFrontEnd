import type { BankStatementLine } from "../entities/BankStatementLine";
import type { BankStatementLineDto } from "@/core/application/dtos/BankStatementLineDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetBankStatementLinesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type BankStatementLineWriteDto = Omit<BankStatementLineDto, "id" | "statementId">;

export interface IBankStatementLineRepository {
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
