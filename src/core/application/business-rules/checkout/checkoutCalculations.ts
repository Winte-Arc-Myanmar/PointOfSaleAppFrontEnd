/**
 * Checkout calculations.
 * Application layer: pure business rules usable by any UI/presentation.
 */

export function safeRate(val: unknown): number {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Computes tax amount for a price that is either tax-inclusive or tax-exclusive.
 * - Inclusive: tax = gross - gross/(1+r)
 * - Exclusive: tax = net*r
 */
export function calcTax(
  amount: number,
  rate: number,
  isPriceInclusive: boolean
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const r = safeRate(rate);
  if (r <= 0) return 0;
  if (isPriceInclusive) return amount - amount / (1 + r);
  return amount * r;
}

export interface CheckoutLineTotalsInput {
  unitPrice: number;
  quantity: number;
  lineDiscount: number;
  isTaxable: boolean;
  taxRate: number;
  isPriceInclusive: boolean;
}

export interface CheckoutLineTotals {
  /** If inclusive: gross. If exclusive: net. (never negative) */
  netOrGross: number;
  taxAmount: number;
  /** Final line total (gross). */
  lineTotal: number;
}

export function calcLineTotals(args: CheckoutLineTotalsInput): CheckoutLineTotals {
  const qty = Number(args.quantity) || 0;
  const unit = Number(args.unitPrice) || 0;
  const discount = Number(args.lineDiscount) || 0;
  const base = unit * qty - discount;
  const netOrGross = base > 0 ? base : 0;

  const taxable = Boolean(args.isTaxable);
  const rate = safeRate(args.taxRate);
  const inclusive = Boolean(args.isPriceInclusive);

  const taxAmount = taxable && rate > 0 ? calcTax(netOrGross, rate, inclusive) : 0;
  const lineTotal = inclusive ? netOrGross : netOrGross + taxAmount;

  return { netOrGross, taxAmount, lineTotal };
}


export interface TaxRateLike {
  /** A fraction: 0.05 is 5%. */
  ratePercentage: number | string;
  isPriceInclusive: boolean;
  appliesToServiceCharge?: boolean;
}

/**
 * A product's taxes as one rate, the way the server charges them: its own taxes,
 * else the shop's defaults. They are all inside the price or all on top, so the
 * rates add up; the first one says which.
 */
export function combinedTax(
  product: { isTaxable?: boolean; taxRates?: TaxRateLike[] },
  defaults: TaxRateLike[]
): { taxRate: number; isPriceInclusive: boolean } {
  if (!product.isTaxable) return { taxRate: 0, isPriceInclusive: false };
  const rates = product.taxRates?.length ? product.taxRates : defaults;
  return {
    taxRate: rates.reduce((sum, rate) => sum + safeRate(rate.ratePercentage), 0),
    isPriceInclusive: Boolean(rates[0]?.isPriceInclusive),
  };
}

/**
 * The shop's service charge on what the items come to before tax, and the tax on
 * it from the default taxes set to apply to it. The server works out the same.
 */
export function calcServiceCharge(
  preTaxTotal: number,
  serviceChargeBps: number,
  defaults: TaxRateLike[]
): { serviceCharge: number; serviceChargeTax: number } {
  if (!(preTaxTotal > 0) || !(serviceChargeBps > 0)) {
    return { serviceCharge: 0, serviceChargeTax: 0 };
  }
  const serviceCharge = (preTaxTotal * serviceChargeBps) / 10000;
  const rate = defaults
    .filter((r) => r.appliesToServiceCharge)
    .reduce((sum, r) => sum + safeRate(r.ratePercentage), 0);
  return { serviceCharge, serviceChargeTax: serviceCharge * rate };
}
