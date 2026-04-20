import type { Receipt } from "@/core/domain/entities/Receipt";

export interface IReceiptService {
  getBySalesOrderId(salesOrderId: string): Promise<Receipt>;
}

