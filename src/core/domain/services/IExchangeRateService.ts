import type { ExchangeRate } from "../entities/ExchangeRate";
import type { ExchangeRateDto } from "@/core/application/dtos/ExchangeRateDto";
import type { GetExchangeRatesParams } from "../repositories/IExchangeRateRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IExchangeRateService {
  getAll(params?: GetExchangeRatesParams): Promise<PaginatedResult<ExchangeRate>>;
  getById(id: string): Promise<ExchangeRate | null>;
  create(
    data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ExchangeRate>;
  update(
    id: string,
    data: Omit<ExchangeRateDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ExchangeRate>;
  delete(id: string): Promise<void>;
}
