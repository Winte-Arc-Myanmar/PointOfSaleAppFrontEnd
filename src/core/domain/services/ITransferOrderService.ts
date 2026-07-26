import type { TransferOrder } from "../entities/TransferOrder";
import type {
  GetTransferOrdersParams,
  TransferOrderWriteDto,
} from "../repositories/ITransferOrderRepository";
import type { PaginatedResult } from "../types/pagination";

export interface ITransferOrderService {
  getAll(params?: GetTransferOrdersParams): Promise<PaginatedResult<TransferOrder>>;
  getById(id: string): Promise<TransferOrder | null>;
  create(data: TransferOrderWriteDto): Promise<TransferOrder>;
  update(id: string, data: TransferOrderWriteDto): Promise<TransferOrder>;
  delete(id: string): Promise<void>;
}
