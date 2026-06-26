import type { IAccountingPeriodService } from "@/core/domain/services/IAccountingPeriodService";
import type { IAccountingPeriodRepository } from "@/core/domain/repositories/IAccountingPeriodRepository";
import type { AccountingPeriod } from "@/core/domain/entities/AccountingPeriod";
import type { GetAccountingPeriodsParams } from "@/core/domain/repositories/IAccountingPeriodRepository";
import type { AccountingPeriodDto } from "../dtos/AccountingPeriodDto";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class AccountingPeriodService implements IAccountingPeriodService {
  constructor(
    private readonly accountingPeriodRepository: IAccountingPeriodRepository
  ) {}

  getAll(params?: GetAccountingPeriodsParams): Promise<PaginatedResult<AccountingPeriod>> {
    return this.accountingPeriodRepository.getAll(params);
  }

  getById(id: string): Promise<AccountingPeriod | null> {
    return this.accountingPeriodRepository.getById(id);
  }

  create(
    data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<AccountingPeriod> {
    return this.accountingPeriodRepository.create(data);
  }

  update(
    id: string,
    data: Omit<AccountingPeriodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<AccountingPeriod> {
    return this.accountingPeriodRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.accountingPeriodRepository.delete(id);
  }
}
