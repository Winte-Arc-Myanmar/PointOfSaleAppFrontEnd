import type { SalesOrder } from "../entities/SalesOrder";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";
import type { GetSalesOrdersParams } from "../repositories/ISalesOrderRepository";
import type { PaginatedResult } from "../types/pagination";


export interface ISalesOrderService {
  getAll(params?: GetSalesOrdersParams): Promise<PaginatedResult<SalesOrder>>;
  getById(id: string): Promise<SalesOrder | null>;
  create(
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder>;
  update(
    id: string,
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder>;
  delete(id: string): Promise<void>;
}

