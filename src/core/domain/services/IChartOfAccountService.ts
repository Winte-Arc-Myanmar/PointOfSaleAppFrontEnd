import type { ChartOfAccount } from "../entities/ChartOfAccount";
import type { ChartOfAccountDto } from "@/core/application/dtos/ChartOfAccountDto";
import type { GetChartOfAccountsParams } from "../repositories/IChartOfAccountRepository";

export interface IChartOfAccountService {
  getAll(params?: GetChartOfAccountsParams): Promise<ChartOfAccount[]>;
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

