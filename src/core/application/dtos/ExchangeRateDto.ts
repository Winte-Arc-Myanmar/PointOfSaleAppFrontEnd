export interface ExchangeRateDto {
  id?: string;
  tenantId: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: string;
  effectiveFrom: string;
  effectiveTo: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
