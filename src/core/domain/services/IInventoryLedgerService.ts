/**
 * Inventory ledger service.
 */

import type { InventoryLedgerEntry } from "../entities/InventoryLedgerEntry";
import type {
  InventoryLedgerDto,
  InventoryLedgerWriteOffDto,
} from "@/core/application/dtos/InventoryLedgerDto";
import type {
  GetInventoryLedgerExpiringParams,
  GetInventoryLedgerParams,
} from "../repositories/IInventoryLedgerRepository";

export interface IInventoryLedgerService {
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
