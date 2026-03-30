/**
 * Inventory ledger repository.
 */

import type { InventoryLedgerEntry } from "../entities/InventoryLedgerEntry";
import type {
  InventoryLedgerDto,
  InventoryLedgerWriteOffDto,
} from "@/core/application/dtos/InventoryLedgerDto";

export interface GetInventoryLedgerParams {
  page?: number;
  limit?: number;
}

export interface GetInventoryLedgerExpiringParams
  extends GetInventoryLedgerParams {
  days?: number;
}

export interface IInventoryLedgerRepository {
  getAll(params?: GetInventoryLedgerParams): Promise<InventoryLedgerEntry[]>;
  getExpiring(
    params?: GetInventoryLedgerExpiringParams
  ): Promise<InventoryLedgerEntry[]>;
  getById(id: string): Promise<InventoryLedgerEntry | null>;
  create(
    data: Omit<InventoryLedgerDto, "id" | "createdAt">
  ): Promise<InventoryLedgerEntry>;
  writeOff(data: InventoryLedgerWriteOffDto): Promise<InventoryLedgerEntry>;
  getBalance(variantId: string, locationId: string): Promise<unknown>;
  delete(id: string): Promise<void>;
}
