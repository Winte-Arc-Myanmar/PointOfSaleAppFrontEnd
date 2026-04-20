import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import type { IReceiptRepository } from "@/core/domain/repositories/IReceiptRepository";
import type { ReceiptDto } from "@/core/application/dtos/ReceiptDto";
import { toReceipt } from "@/core/application/mappers/ReceiptMapper";
import type { Receipt } from "@/core/domain/entities/Receipt";

export class ApiReceiptRepository implements IReceiptRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getBySalesOrderId(salesOrderId: string): Promise<Receipt> {
    const dto = await this.httpClient.get<ReceiptDto>(
      API_ENDPOINTS.RECEIPTS.BY_SALES_ORDER_ID(salesOrderId)
    );
    return toReceipt(dto);
  }
}

