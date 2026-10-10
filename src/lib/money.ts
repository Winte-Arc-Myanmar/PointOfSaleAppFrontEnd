import type { TenantCurrency } from "@/core/domain/entities/Tenant";

/** The shop's currency, set by CurrencyProvider once the shop is known. */
let shopCurrency: TenantCurrency = "MMK";

export function setShopCurrency(currency: TenantCurrency): void {
  shopCurrency = currency;
}

const kyat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const dollar = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 9,024,673 MMK or $36,000.00; a dash when there is no amount. */
export function formatMoney(
  value: string | number | null | undefined,
  currency: TenantCurrency = shopCurrency,
): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return "—";
  return currency === "USD" ? `$${dollar.format(n)}` : `${kyat.format(n)} MMK`;
}
