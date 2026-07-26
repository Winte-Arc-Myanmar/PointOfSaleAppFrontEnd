import type { TransferOrder } from "../entities/TransferOrder";
import type { TransferOrderDto } from "@/core/application/dtos/TransferOrderDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetTransferOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type TransferOrderWriteDto = Omit<
  TransferOrderDto,
  "id" | "status" | "shippedAt" | "receivedAt" | "createdAt" | "updatedAt"
>;

export interface ITransferOrderRepository {
  getAll(params?: GetTransferOrdersParams): Promise<PaginatedResult<TransferOrder>>;
  getById(id: string): Promise<TransferOrder | null>;
  create(data: TransferOrderWriteDto): Promise<TransferOrder>;
  update(id: string, data: TransferOrderWriteDto): Promise<TransferOrder>;
  delete(id: string): Promise<void>;
}
