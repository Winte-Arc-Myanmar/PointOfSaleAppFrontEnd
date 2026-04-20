import type { IReceiptService } from "@/core/domain/services/IReceiptService";
import type { IReceiptRepository } from "@/core/domain/repositories/IReceiptRepository";
import type { Receipt } from "@/core/domain/entities/Receipt";

export class ReceiptService implements IReceiptService {
  constructor(private readonly receiptRepository: IReceiptRepository) {}

  getBySalesOrderId(salesOrderId: string): Promise<Receipt> {
    return this.receiptRepository.getBySalesOrderId(salesOrderId);
  }
}

