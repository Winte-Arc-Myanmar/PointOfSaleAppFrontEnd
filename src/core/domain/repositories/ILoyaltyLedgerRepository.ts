/**
 * Loyalty ledger repository interface.
 * Domain layer - nested under a customer.
 */

import type { LoyaltyLedgerEntry } from "../entities/LoyaltyLedgerEntry";
import type { LoyaltyLedgerEntryDto } from "@/core/application/dtos/LoyaltyLedgerEntryDto";

export interface GetLoyaltyLedgerParams {
  page?: number;
  limit?: number;
}

export interface ILoyaltyLedgerRepository {
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
