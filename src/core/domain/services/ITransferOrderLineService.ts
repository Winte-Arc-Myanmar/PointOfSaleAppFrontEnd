import type { TransferOrderLine } from "../entities/TransferOrderLine";
import type {
  GetTransferOrderLinesParams,
  TransferOrderLineWriteDto,
} from "../repositories/ITransferOrderLineRepository";
import type { PaginatedResult } from "../types/pagination";

export interface ITransferOrderLineService {
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
