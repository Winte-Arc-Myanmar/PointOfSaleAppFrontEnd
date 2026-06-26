import type { ChartOfAccount } from "../entities/ChartOfAccount";
import type { ChartOfAccountDto } from "@/core/application/dtos/ChartOfAccountDto";
import type { PaginatedResult } from "../types/pagination";


export interface GetChartOfAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IChartOfAccountRepository {
  getAll(params?: GetChartOfAccountsParams): Promise<PaginatedResult<ChartOfAccount>>;
  getById(id: string): Promise<ChartOfAccount | null>;
  create(
    data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ChartOfAccount>;
  update(
    id: string,
    data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ChartOfAccount>;
  delete(id: string): Promise<void>;
}

