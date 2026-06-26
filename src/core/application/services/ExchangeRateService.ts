import type { IExchangeRateService } from "@/core/domain/services/IExchangeRateService";
import type { IExchangeRateRepository } from "@/core/domain/repositories/IExchangeRateRepository";
import type { ExchangeRate } from "@/core/domain/entities/ExchangeRate";
import type { GetExchangeRatesParams } from "@/core/domain/repositories/IExchangeRateRepository";
import type { ExchangeRateDto } from "../dtos/ExchangeRateDto";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class ExchangeRateService implements IExchangeRateService {
  constructor(private readonly exchangeRateRepository: IExchangeRateRepository) {}

  getAll(params?: GetExchangeRatesParams): Promise<PaginatedResult<ExchangeRate>> {
    return this.exchangeRateRepository.getAll(params);
  }

  getById(id: string): Promise<ExchangeRate | null> {
    return this.exchangeRateRepository.getById(id);
  }

  create(
    data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ExchangeRate> {
    return this.exchangeRateRepository.create(data);
  }

  update(
    id: string,
    data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ExchangeRate> {
    return this.exchangeRateRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.exchangeRateRepository.delete(id);
  }
}
