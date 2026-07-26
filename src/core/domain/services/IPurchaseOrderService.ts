import type { PurchaseOrder } from "../entities/PurchaseOrder";
import type {
  GetPurchaseOrdersParams,
  PurchaseOrderWriteDto,
} from "../repositories/IPurchaseOrderRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IPurchaseOrderService {
  getAll(
    params?: GetPurchaseOrdersParams,
  ): Promise<PaginatedResult<PurchaseOrder>>;
  getById(id: string): Promise<PurchaseOrder | null>;
  create(data: PurchaseOrderWriteDto): Promise<PurchaseOrder>;
  update(id: string, data: PurchaseOrderWriteDto): Promise<PurchaseOrder>;
  delete(id: string): Promise<void>;
}
