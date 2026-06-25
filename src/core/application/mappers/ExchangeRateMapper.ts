import type { ExchangeRate } from "@/core/domain/entities/ExchangeRate";
import type { ExchangeRateDto } from "../dtos/ExchangeRateDto";

export function toExchangeRate(
  dto: ExchangeRateDto & { id: string }
): ExchangeRate {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    baseCurrency: dto.baseCurrency ?? "",
    targetCurrency: dto.targetCurrency ?? "",
    rate: dto.rate ?? "",
    effectiveFrom: dto.effectiveFrom ?? "",
    effectiveTo: dto.effectiveTo ?? "",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toExchangeRateDto(
  rate: Partial<ExchangeRate>
): ExchangeRateDto {
  return {
    ...(rate.id && { id: String(rate.id) }),
    tenantId: rate.tenantId ?? "",
    baseCurrency: rate.baseCurrency ?? "",
    targetCurrency: rate.targetCurrency ?? "",
    rate: rate.rate ?? "",
    effectiveFrom: rate.effectiveFrom ?? "",
    effectiveTo: rate.effectiveTo ?? "",
  };
}
