import type { IChartOfAccountService } from "@/core/domain/services/IChartOfAccountService";
import type { IChartOfAccountRepository } from "@/core/domain/repositories/IChartOfAccountRepository";
import type { ChartOfAccount } from "@/core/domain/entities/ChartOfAccount";
import type { GetChartOfAccountsParams } from "@/core/domain/repositories/IChartOfAccountRepository";
import type { ChartOfAccountDto } from "../dtos/ChartOfAccountDto";

export class ChartOfAccountService implements IChartOfAccountService {
  constructor(
    private readonly chartOfAccountRepository: IChartOfAccountRepository
  ) {}

  getAll(params?: GetChartOfAccountsParams): Promise<ChartOfAccount[]> {
    return this.chartOfAccountRepository.getAll(params);
  }

  getById(id: string): Promise<ChartOfAccount | null> {
    return this.chartOfAccountRepository.getById(id);
  }

  create(
    data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ChartOfAccount> {
    return this.chartOfAccountRepository.create(data);
  }

  update(
    id: string,
    data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ChartOfAccount> {
    return this.chartOfAccountRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.chartOfAccountRepository.delete(id);
  }
}

