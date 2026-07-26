import type { IPurchaseRequisitionService } from "@/core/domain/services/IPurchaseRequisitionService";
import type { IPurchaseRequisitionRepository } from "@/core/domain/repositories/IPurchaseRequisitionRepository";
import type { PurchaseRequisition } from "@/core/domain/entities/PurchaseRequisition";
import type {
  GetPurchaseRequisitionsParams,
  PurchaseRequisitionWriteDto,
} from "@/core/domain/repositories/IPurchaseRequisitionRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class PurchaseRequisitionService implements IPurchaseRequisitionService {
  constructor(
    private readonly purchaseRequisitionRepository: IPurchaseRequisitionRepository,
  ) {}

  getAll(
    params?: GetPurchaseRequisitionsParams,
  ): Promise<PaginatedResult<PurchaseRequisition>> {
    return this.purchaseRequisitionRepository.getAll(params);
  }

  getById(id: string): Promise<PurchaseRequisition | null> {
    return this.purchaseRequisitionRepository.getById(id);
  }

  create(
    data: PurchaseRequisitionWriteDto,
  ): Promise<PurchaseRequisition> {
    return this.purchaseRequisitionRepository.create(data);
  }

  update(
    id: string,
    data: PurchaseRequisitionWriteDto,
  ): Promise<PurchaseRequisition> {
    return this.purchaseRequisitionRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.purchaseRequisitionRepository.delete(id);
  }
}
