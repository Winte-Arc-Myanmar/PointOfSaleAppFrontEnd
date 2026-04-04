/**
 * Loyalty ledger service implementation.
 * Application layer - delegates to ILoyaltyLedgerRepository.
 */

import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";
import type {
  GetLoyaltyLedgerParams,
  ILoyaltyLedgerRepository,
} from "@/core/domain/repositories/ILoyaltyLedgerRepository";
import type { ILoyaltyLedgerService } from "@/core/domain/services/ILoyaltyLedgerService";
import type { LoyaltyLedgerEntryDto } from "../dtos/LoyaltyLedgerEntryDto";

export class LoyaltyLedgerService implements ILoyaltyLedgerService {
  constructor(private readonly repository: ILoyaltyLedgerRepository) {}

  async getAll(
    customerId: string,
    params?: GetLoyaltyLedgerParams
  ): Promise<LoyaltyLedgerEntry[]> {
    return this.repository.getAll(customerId, params);
  }

  async getById(
    customerId: string,
    id: string
  ): Promise<LoyaltyLedgerEntry | null> {
    return this.repository.getById(customerId, id);
  }

  async create(
    customerId: string,
    data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">
  ): Promise<LoyaltyLedgerEntry> {
    return this.repository.create(customerId, data);
  }

  async update(
    customerId: string,
    id: string,
    data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">
  ): Promise<LoyaltyLedgerEntry> {
    return this.repository.update(customerId, id, data);
  }

  async delete(customerId: string, id: string): Promise<void> {
    return this.repository.delete(customerId, id);
  }
}
