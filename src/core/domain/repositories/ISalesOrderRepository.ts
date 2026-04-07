import type { SalesOrder } from "../entities/SalesOrder";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";

export interface GetSalesOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ISalesOrderRepository {
  getAll(params?: GetSalesOrdersParams): Promise<SalesOrder[]>;
  getById(id: string): Promise<SalesOrder | null>;
  create(data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">): Promise<SalesOrder>;
  update(
    id: string,
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder>;
  delete(id: string): Promise<void>;
}

