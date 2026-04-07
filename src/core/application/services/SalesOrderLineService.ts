import type { ISalesOrderLineService } from "@/core/domain/services/ISalesOrderLineService";
import type { ISalesOrderLineRepository } from "@/core/domain/repositories/ISalesOrderLineRepository";
import type { SalesOrderLine } from "@/core/domain/entities/SalesOrderLine";
import type { GetSalesOrderLinesParams } from "@/core/domain/repositories/ISalesOrderLineRepository";
import type { SalesOrderLineDto } from "../dtos/SalesOrderLineDto";

export class SalesOrderLineService implements ISalesOrderLineService {
  constructor(private readonly salesOrderLineRepository: ISalesOrderLineRepository) {}

  getAll(
    salesOrderId: string,
    params?: GetSalesOrderLinesParams
  ): Promise<SalesOrderLine[]> {
    return this.salesOrderLineRepository.getAll(salesOrderId, params);
  }

  getById(salesOrderId: string, id: string): Promise<SalesOrderLine | null> {
    return this.salesOrderLineRepository.getById(salesOrderId, id);
  }

  create(
    salesOrderId: string,
    data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
  ): Promise<SalesOrderLine> {
    return this.salesOrderLineRepository.create(salesOrderId, data);
  }

  update(
    salesOrderId: string,
    id: string,
    data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
  ): Promise<SalesOrderLine> {
    return this.salesOrderLineRepository.update(salesOrderId, id, data);
  }

  delete(salesOrderId: string, id: string): Promise<void> {
    return this.salesOrderLineRepository.delete(salesOrderId, id);
  }
}

