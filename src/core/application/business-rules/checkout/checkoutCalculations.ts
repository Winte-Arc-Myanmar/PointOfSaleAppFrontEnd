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

