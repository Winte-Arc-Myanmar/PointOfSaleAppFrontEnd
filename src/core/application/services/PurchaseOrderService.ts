import type { IPurchaseOrderService } from "@/core/domain/services/IPurchaseOrderService";
import type { IPurchaseOrderRepository } from "@/core/domain/repositories/IPurchaseOrderRepository";
import type { PurchaseOrder } from "@/core/domain/entities/PurchaseOrder";
import type {
  GetPurchaseOrdersParams,
  PurchaseOrderWriteDto,
} from "@/core/domain/repositories/IPurchaseOrderRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class PurchaseOrderService implements IPurchaseOrderService {
  constructor(
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  getAll(
    params?: GetPurchaseOrdersParams,
  ): Promise<PaginatedResult<PurchaseOrder>> {
    return this.purchaseOrderRepository.getAll(params);
  }

  getById(id: string): Promise<PurchaseOrder | null> {
    return this.purchaseOrderRepository.getById(id);
  }

  create(data: PurchaseOrderWriteDto): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.create(data);
  }

  update(id: string, data: PurchaseOrderWriteDto): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.purchaseOrderRepository.delete(id);
  }
}
