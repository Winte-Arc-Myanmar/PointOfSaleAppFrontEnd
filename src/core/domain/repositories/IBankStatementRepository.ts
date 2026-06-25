import type { BankStatement } from "../entities/BankStatement";
import type { BankStatementDto } from "@/core/application/dtos/BankStatementDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetBankStatementsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type BankStatementWriteDto = Omit<
  BankStatementDto,
  "id" | "createdAt" | "updatedAt"
>;

export interface IBankStatementRepository {
  getAll(params?: GetBankStatementsParams): Promise<PaginatedResult<BankStatement>>;
  getById(id: string): Promise<BankStatement | null>;
  create(data: BankStatementWriteDto): Promise<BankStatement>;
  update(id: string, data: BankStatementWriteDto): Promise<BankStatement>;
  delete(id: string): Promise<void>;
}
