import type { ITaxRateService } from "@/core/domain/services/ITaxRateService";
import type { ITaxRateRepository } from "@/core/domain/repositories/ITaxRateRepository";
import type { TaxRate } from "@/core/domain/entities/TaxRate";
import type { GetTaxRatesParams } from "@/core/domain/repositories/ITaxRateRepository";
import type { TaxRateDto } from "../dtos/TaxRateDto";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class TaxRateService implements ITaxRateService {
  constructor(private readonly taxRateRepository: ITaxRateRepository) {}

  getAll(params?: GetTaxRatesParams): Promise<PaginatedResult<TaxRate>> {
    return this.taxRateRepository.getAll(params);
  }

  getById(id: string): Promise<TaxRate | null> {
    return this.taxRateRepository.getById(id);
  }

  create(
    data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<TaxRate> {
    return this.taxRateRepository.create(data);
  }

  update(
    id: string,
    data: Omit<TaxRateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<TaxRate> {
    return this.taxRateRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.taxRateRepository.delete(id);
  }
}
