/**
 * Inventory ledger API DTOs.
 */

export interface InventoryLedgerDto {
  id?: string;
  tenantId: string;
  locationId: string;
  variantId: string;
  transactionType: string;
  referenceId?: string | null;
  /** API decimal string */
  quantity?: string | number | unknown;
  /** API decimal string */
  unitCost?: string | number | unknown;
  serialNumber?: string | null;
  batchNumber?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
}

export interface InventoryLedgerWriteOffDto {
  tenantId: string;
  variantId: string;
  locationId: string;
  quantity: string | number;
  reason: string;
  batchNumber?: string | null;
  unitCost?: string | number;
}
