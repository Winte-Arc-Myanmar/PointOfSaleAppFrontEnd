/**
 * Loyalty ledger service interface.
 * Domain layer.
 */

import type { LoyaltyLedgerEntry } from "../entities/LoyaltyLedgerEntry";
import type { LoyaltyLedgerEntryDto } from "@/core/application/dtos/LoyaltyLedgerEntryDto";
import type { GetLoyaltyLedgerParams } from "../repositories/ILoyaltyLedgerRepository";

export interface ILoyaltyLedgerService {
  getAll(
    customerId: string,
    params?: GetLoyaltyLedgerParams
  ): Promise<LoyaltyLedgerEntry[]>;
  getById(customerId: string, id: string): Promise<LoyaltyLedgerEntry | null>;
  create(
    customerId: string,
    data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">
  ): Promise<LoyaltyLedgerEntry>;
  update(
    customerId: string,
    id: string,
    data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">
  ): Promise<LoyaltyLedgerEntry>;
  delete(customerId: string, id: string): Promise<void>;
}
