/**
 * Inventory ledger application service.
 */

import type { IInventoryLedgerService } from "@/core/domain/services/IInventoryLedgerService";
import type { IInventoryLedgerRepository } from "@/core/domain/repositories/IInventoryLedgerRepository";
import type {
  InventoryLedgerDto,
  InventoryLedgerWriteOffDto,
} from "../dtos/InventoryLedgerDto";
import type {
  GetInventoryLedgerExpiringParams,
  GetInventoryLedgerParams,
} from "@/core/domain/repositories/IInventoryLedgerRepository";

export class InventoryLedgerService implements IInventoryLedgerService {
  constructor(
    private readonly inventoryLedgerRepository: IInventoryLedgerRepository
  ) {}

  getAll(params?: GetInventoryLedgerParams) {
    return this.inventoryLedgerRepository.getAll(params);
  }

  getExpiring(params?: GetInventoryLedgerExpiringParams) {
    return this.inventoryLedgerRepository.getExpiring(params);
  }

  getById(id: string) {
    return this.inventoryLedgerRepository.getById(id);
  }

  create(data: Omit<InventoryLedgerDto, "id" | "createdAt">) {
    return this.inventoryLedgerRepository.create(data);
  }

  writeOff(data: InventoryLedgerWriteOffDto) {
    return this.inventoryLedgerRepository.writeOff(data);
  }

  getBalance(variantId: string, locationId: string) {
    return this.inventoryLedgerRepository.getBalance(variantId, locationId);
  }

  delete(id: string) {
    return this.inventoryLedgerRepository.delete(id);
  }
}
