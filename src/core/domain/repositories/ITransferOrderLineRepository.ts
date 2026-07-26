import type { TransferOrderLine } from "../entities/TransferOrderLine";
import type { TransferOrderLineDto } from "@/core/application/dtos/TransferOrderLineDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetTransferOrderLinesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type TransferOrderLineWriteDto = Omit<
  TransferOrderLineDto,
  "id" | "transferOrderId" | "createdAt" | "updatedAt"
>;

export interface ITransferOrderLineRepository {
  getAll(
    transferOrderId: string,
    params?: GetTransferOrderLinesParams,
  ): Promise<PaginatedResult<TransferOrderLine>>;
  getById(
    transferOrderId: string,
    id: string,
  ): Promise<TransferOrderLine | null>;
  create(
    transferOrderId: string,
    data: TransferOrderLineWriteDto,
  ): Promise<TransferOrderLine>;
  update(
    transferOrderId: string,
    id: string,
    data: TransferOrderLineWriteDto,
  ): Promise<TransferOrderLine>;
  delete(transferOrderId: string, id: string): Promise<void>;
}
