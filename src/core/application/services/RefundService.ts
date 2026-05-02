import type { IRefundService } from "@/core/domain/services/IRefundService";
import type { IRefundRepository } from "@/core/domain/repositories/IRefundRepository";
import type { RefundRequestDto } from "@/core/application/dtos/RefundDto";
import type { Refund } from "@/core/domain/entities/Refund";

export class RefundService implements IRefundService {
  constructor(private readonly refundRepository: IRefundRepository) {}

  create(data: RefundRequestDto): Promise<Refund> {
    return this.refundRepository.create(data);
  }

  getById(id: string): Promise<Refund | null> {
    return this.refundRepository.getById(id);
  }

  getBySalesOrderId(salesOrderId: string): Promise<Refund[]> {
    return this.refundRepository.getBySalesOrderId(salesOrderId);
  }
}

