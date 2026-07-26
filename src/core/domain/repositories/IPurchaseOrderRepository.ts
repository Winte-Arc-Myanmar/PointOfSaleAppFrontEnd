import type { PurchaseOrder } from "../entities/PurchaseOrder";
import type { PurchaseOrderDto } from "@/core/application/dtos/PurchaseOrderDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetPurchaseOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type PurchaseOrderWriteDto = Omit<
  PurchaseOrderDto,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export interface IPurchaseOrderRepository {
  getAll(
    params?: GetPurchaseOrdersParams,
  ): Promise<PaginatedResult<PurchaseOrder>>;
  getById(id: string): Promise<PurchaseOrder | null>;
  create(data: PurchaseOrderWriteDto): Promise<PurchaseOrder>;
  update(id: string, data: PurchaseOrderWriteDto): Promise<PurchaseOrder>;
  delete(id: string): Promise<void>;
}
