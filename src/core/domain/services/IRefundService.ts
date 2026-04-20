import type { RefundRequestDto } from "@/core/application/dtos/RefundDto";
import type { Refund } from "@/core/domain/entities/Refund";

export interface IRefundService {
  create(data: RefundRequestDto): Promise<Refund>;
  getById(id: string): Promise<Refund | null>;
  getBySalesOrderId(salesOrderId: string): Promise<Refund[]>;
}

