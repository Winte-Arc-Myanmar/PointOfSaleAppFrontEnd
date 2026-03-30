/** Transaction type values sent to POST /inventory-ledger */

export const LEDGER_TRANSACTION_TYPES = [
  { value: "GRN_RECEIPT", label: "GRN receipt" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "SALE", label: "Sale" },
  { value: "RETURN", label: "Return" },
  { value: "WRITE_OFF", label: "Write-off" },
] as const;
