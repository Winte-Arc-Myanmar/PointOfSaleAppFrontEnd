/**
 * Loyalty ledger entry entity <-> DTO mappers.
 * Application layer.
 */

import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";
import type { LoyaltyLedgerEntryDto } from "../dtos/LoyaltyLedgerEntryDto";

export function toLoyaltyLedgerEntry(
  dto: LoyaltyLedgerEntryDto & { id: string },
  fallbackCustomerId: string
): LoyaltyLedgerEntry {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    customerId: dto.customerId ?? fallbackCustomerId,
    transactionType: dto.transactionType ?? "EARN",
    points: Number(dto.points ?? 0),
    referenceOrderId:
      dto.referenceOrderId != null && dto.referenceOrderId !== ""
        ? dto.referenceOrderId
        : null,
    expiryDate:
      dto.expiryDate != null && dto.expiryDate !== "" ? dto.expiryDate : null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
