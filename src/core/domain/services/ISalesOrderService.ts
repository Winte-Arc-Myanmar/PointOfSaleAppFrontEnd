import type { SalesOrder } from "../entities/SalesOrder";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";
import type { GetSalesOrdersParams } from "../repositories/ISalesOrderRepository";

export interface ISalesOrderService {
  getAll(params?: GetSalesOrdersParams): Promise<SalesOrder[]>;
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

