import type { SalesOrderLine } from "../entities/SalesOrderLine";
import type { SalesOrderLineDto } from "@/core/application/dtos/SalesOrderLineDto";
import type { GetSalesOrderLinesParams } from "../repositories/ISalesOrderLineRepository";
import type { PaginatedResult } from "../types/pagination";


export interface ISalesOrderLineService {
  getAll(
    salesOrderId: string,
    params?: GetSalesOrderLinesParams
  ): Promise<PaginatedResult<SalesOrderLine>>;
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

