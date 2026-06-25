import type { TaxRate } from "../entities/TaxRate";
import type { TaxRateDto } from "@/core/application/dtos/TaxRateDto";
import type { GetTaxRatesParams } from "../repositories/ITaxRateRepository";
import type { PaginatedResult } from "../types/pagination";

export interface ITaxRateService {
  getAll(params?: GetTaxRatesParams): Promise<PaginatedResult<TaxRate>>;
  getById(id: string): Promise<TaxRate | null>;
  create(
    data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<TaxRate>;
  update(
    id: string,
    data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<TaxRate>;
  delete(id: string): Promise<void>;
}
