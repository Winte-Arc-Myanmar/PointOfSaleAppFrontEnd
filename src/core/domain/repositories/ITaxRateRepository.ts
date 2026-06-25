import type { TaxRate } from "../entities/TaxRate";
import type { TaxRateDto } from "@/core/application/dtos/TaxRateDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetTaxRatesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface ITaxRateRepository {
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
