export interface TaxRateDto {
  id?: string;
  tenantId: string;
  name: string;
  ratePercentage: string;
  isPriceInclusive: boolean;
  glLiabilityAccountId: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
