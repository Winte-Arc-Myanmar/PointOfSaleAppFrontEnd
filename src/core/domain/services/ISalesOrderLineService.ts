import type { SalesOrderLine } from "../entities/SalesOrderLine";
import type { SalesOrderLineDto } from "@/core/application/dtos/SalesOrderLineDto";
import type { GetSalesOrderLinesParams } from "../repositories/ISalesOrderLineRepository";

export interface ISalesOrderLineService {
  getAll(
    salesOrderId: string,
    params?: GetSalesOrderLinesParams
  ): Promise<SalesOrderLine[]>;
  getById(salesOrderId: string, id: string): Promise<SalesOrderLine | null>;
  create(
    salesOrderId: string,
    data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
  ): Promise<SalesOrderLine>;
  update(
    salesOrderId: string,
    id: string,
    data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
  ): Promise<SalesOrderLine>;
  delete(salesOrderId: string, id: string): Promise<void>;
}

