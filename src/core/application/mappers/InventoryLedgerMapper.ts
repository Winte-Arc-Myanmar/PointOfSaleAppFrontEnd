/**
 * Inventory ledger DTO → entity.
 */

import type { InventoryLedgerEntry } from "@/core/domain/entities/InventoryLedgerEntry";
import type { InventoryLedgerDto } from "../dtos/InventoryLedgerDto";

function parseDecimal(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function toInventoryLedgerEntry(
  dto: InventoryLedgerDto & { id: string }
): InventoryLedgerEntry {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    variantId: dto.variantId ?? "",
    transactionType: dto.transactionType ?? "",
    referenceId: dto.referenceId ?? null,
    quantity: parseDecimal(dto.quantity),
    unitCost: parseDecimal(dto.unitCost),
    serialNumber: dto.serialNumber ?? null,
    batchNumber: dto.batchNumber ?? null,
    manufacturingDate: dto.manufacturingDate ?? null,
    expiryDate: dto.expiryDate ?? null,
    createdAt: dto.createdAt ?? null,
    createdBy: dto.createdBy ?? null,
  };
}
