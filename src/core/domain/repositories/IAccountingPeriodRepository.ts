import type { AccountingPeriod } from "../entities/AccountingPeriod";
import type { AccountingPeriodDto } from "@/core/application/dtos/AccountingPeriodDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetAccountingPeriodsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IAccountingPeriodRepository {
  getAll(params?: GetAccountingPeriodsParams): Promise<PaginatedResult<AccountingPeriod>>;
  getById(id: string): Promise<AccountingPeriod | null>;
  create(
    data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<AccountingPeriod>;
  update(
    id: string,
    data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<AccountingPeriod>;
  delete(id: string): Promise<void>;
}
