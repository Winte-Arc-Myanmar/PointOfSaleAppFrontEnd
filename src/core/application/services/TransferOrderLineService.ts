import type { ITransferOrderLineService } from "@/core/domain/services/ITransferOrderLineService";
import type { ITransferOrderLineRepository } from "@/core/domain/repositories/ITransferOrderLineRepository";
import type { TransferOrderLine } from "@/core/domain/entities/TransferOrderLine";
import type {
  GetTransferOrderLinesParams,
  TransferOrderLineWriteDto,
} from "@/core/domain/repositories/ITransferOrderLineRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class TransferOrderLineService implements ITransferOrderLineService {
  constructor(
    private readonly transferOrderLineRepository: ITransferOrderLineRepository,
  ) {}

  getAll(
    transferOrderId: string,
    params?: GetTransferOrderLinesParams,
  ): Promise<PaginatedResult<TransferOrderLine>> {
    return this.transferOrderLineRepository.getAll(transferOrderId, params);
  }

  getById(
    transferOrderId: string,
    id: string,
  ): Promise<TransferOrderLine | null> {
    return this.transferOrderLineRepository.getById(transferOrderId, id);
  }

  create(
    transferOrderId: string,
    data: TransferOrderLineWriteDto,
  ): Promise<TransferOrderLine> {
    return this.transferOrderLineRepository.create(transferOrderId, data);
  }

  update(
    transferOrderId: string,
    id: string,
    data: TransferOrderLineWriteDto,
  ): Promise<TransferOrderLine> {
    return this.transferOrderLineRepository.update(transferOrderId, id, data);
  }

  delete(transferOrderId: string, id: string): Promise<void> {
    return this.transferOrderLineRepository.delete(transferOrderId, id);
  }
}
