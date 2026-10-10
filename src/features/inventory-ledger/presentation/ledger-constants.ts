/** Transaction type values sent to POST /inventory-ledger */

export const LEDGER_TRANSACTION_TYPES = [
  { value: "GRN_RECEIPT", label: "GRN receipt" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "SALE", label: "Sale" },
  { value: "RETURN", label: "Return" },
  { value: "WRITE_OFF", label: "Write-off" },
] as const;

const TYPE_LABELS: Record<string, string> = {
  GRN_RECEIPT: "Goods received",
  STOCK_COUNT: "Stock count",
  OPENING_BALANCE: "Opening stock",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
  SALE: "Sale",
  SALE_VOID: "Sale voided",
  RETURN: "Return",
  WRITE_OFF: "Write-off",
  EXPIRED: "Expired",
};

/** "Stock count" for STOCK_COUNT; unknown codes are spelled out the same way. */
export function ledgerTypeLabel(code: string | null | undefined): string {
  if (!code) return "-";
  const known = TYPE_LABELS[code];
  if (known) return known;
  const words = code.toLowerCase().split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
