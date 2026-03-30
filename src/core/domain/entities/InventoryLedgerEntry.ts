/**
 * Inventory ledger entry (stock movement / valuation line).
 */

export interface InventoryLedgerEntry {
  id: string;
  tenantId: string;
  locationId: string;
  variantId: string;
  transactionType: string;
  referenceId: string | null;
  quantity: number;
  unitCost: number;
  serialNumber: string | null;
  batchNumber: string | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  createdAt: string | null;
  createdBy: string | null;
}
