import type { TaxRate } from "@/core/domain/entities/TaxRate";
import type { TaxRateDto } from "../dtos/TaxRateDto";

export function toTaxRate(dto: TaxRateDto & { id: string }): TaxRate {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    ratePercentage: dto.ratePercentage ?? "",
    isPriceInclusive: Boolean(dto.isPriceInclusive),
    glLiabilityAccountId: dto.glLiabilityAccountId ?? "",
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toTaxRateDto(rate: Partial<TaxRate>): TaxRateDto {
  return {
    ...(rate.id && { id: String(rate.id) }),
    tenantId: rate.tenantId ?? "",
    name: rate.name ?? "",
    ratePercentage: rate.ratePercentage ?? "",
    isPriceInclusive: Boolean(rate.isPriceInclusive),
    glLiabilityAccountId: rate.glLiabilityAccountId ?? "",
  };
}
