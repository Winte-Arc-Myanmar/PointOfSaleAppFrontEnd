export type RoomPaymentTiming = "PAY_WHEN_ORDERING" | "PAY_AT_END";
export type PriceCurrency = "MMK" | "USD";

export interface DefaultTaxRate {
  id: string;
  name: string;
  /** A fraction: 0.05 is 5%. */
  ratePercentage: string;
  isPriceInclusive: boolean;
  appliesToServiceCharge: boolean;
}

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
  /** Removing an item or cancelling an order the kitchen has prints a DELETE slip. */
  kdsDeleteSlips: boolean;
  /** Taxes on taxable products that have none of their own; empty for none. */
  defaultTaxRateIds: string[];
  defaultTaxRates?: DefaultTaxRate[];
  /** Service charge in basis points: 1000 is 10%. */
  serviceChargeBps: number;
  serviceChargeOnBar: boolean;
  serviceChargeOnSpa: boolean;
  serviceChargeOnKtv: boolean;
  /** A hostess's commission on what she orders, in basis points (500 = 5%), unless she has her own. */
  hostessMenuCommissionBps: number;
  updatedAt: string | null;
}

export type VenueSettingUpdate = Partial<Omit<VenueSetting, "tenantId" | "updatedAt" | "defaultTaxRates">>;
