import type { ITransferOrderService } from "@/core/domain/services/ITransferOrderService";
import type { ITransferOrderRepository } from "@/core/domain/repositories/ITransferOrderRepository";
import type { TransferOrder } from "@/core/domain/entities/TransferOrder";
import type {
  GetTransferOrdersParams,
  TransferOrderWriteDto,
} from "@/core/domain/repositories/ITransferOrderRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class TransferOrderService implements ITransferOrderService {
  constructor(
    private readonly transferOrderRepository: ITransferOrderRepository,
  ) {}

  getAll(
    params?: GetTransferOrdersParams,
  ): Promise<PaginatedResult<TransferOrder>> {
    return this.transferOrderRepository.getAll(params);
  }

  getById(id: string): Promise<TransferOrder | null> {
    return this.transferOrderRepository.getById(id);
  }

  create(data: TransferOrderWriteDto): Promise<TransferOrder> {
    return this.transferOrderRepository.create(data);
  }

  update(id: string, data: TransferOrderWriteDto): Promise<TransferOrder> {
    return this.transferOrderRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.transferOrderRepository.delete(id);
  }
}
