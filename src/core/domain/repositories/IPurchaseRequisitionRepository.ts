import type { PurchaseRequisition } from "../entities/PurchaseRequisition";
import type { PurchaseRequisitionDto } from "@/core/application/dtos/PurchaseRequisitionDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetPurchaseRequisitionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type PurchaseRequisitionWriteDto = Omit<
  PurchaseRequisitionDto,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export interface IPurchaseRequisitionRepository {
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
