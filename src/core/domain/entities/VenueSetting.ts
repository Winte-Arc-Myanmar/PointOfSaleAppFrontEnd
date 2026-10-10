export type RoomPaymentTiming = "PAY_WHEN_ORDERING" | "PAY_AT_END";
export type PriceCurrency = "MMK" | "USD";

export interface VenueSetting {
  tenantId: string;
  spaEnabled: boolean;
  spaMenuOrdering: boolean;
  ktvEnabled: boolean;
  ktvMenuOrdering: boolean;
  paymentTiming: RoomPaymentTiming;
  maxPromotionsPerItem: number;
  /** Different promotions one bill can use; null for no limit. */
  maxPromotionsPerBill: number | null;
  /** The money customers pay in, shown on receipts. */
  currency: PriceCurrency;
  /** Sales check and deduct menu stock; off for a business without inventory. */
  trackStock: boolean;
  /** Taxes taxable products that have no tax rate of their own; null for none. */
  defaultTaxRateId: string | null;
  defaultTaxRate?: {
    id: string;
    name: string;
    /** A fraction: 0.05 is 5%. */
    ratePercentage: string;
    isPriceInclusive: boolean;
  } | null;
  updatedAt: string | null;
}

export type VenueSettingUpdate = Partial<Omit<VenueSetting, "tenantId" | "updatedAt" | "defaultTaxRate">>;
