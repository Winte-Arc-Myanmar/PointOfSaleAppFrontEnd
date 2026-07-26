import type { PurchaseRequisition } from "../entities/PurchaseRequisition";
import type {
  GetPurchaseRequisitionsParams,
  PurchaseRequisitionWriteDto,
} from "../repositories/IPurchaseRequisitionRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IPurchaseRequisitionService {
  getAll(
    params?: GetPurchaseRequisitionsParams,
  ): Promise<PaginatedResult<PurchaseRequisition>>;
  getById(id: string): Promise<PurchaseRequisition | null>;
  create(data: PurchaseRequisitionWriteDto): Promise<PurchaseRequisition>;
  update(
    id: string,
    data: PurchaseRequisitionWriteDto,
  ): Promise<PurchaseRequisition>;
  delete(id: string): Promise<void>;
}
