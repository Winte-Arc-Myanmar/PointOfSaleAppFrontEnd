import type { Receipt } from "@/core/domain/entities/Receipt";

export interface IReceiptRepository {
  getBySalesOrderId(salesOrderId: string): Promise<Receipt>;
}

