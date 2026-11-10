import type { BulkDeleteResult, SalesOrder } from "../entities/SalesOrder";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";
import type { PaginatedResult } from "../types/pagination";
import type {
  SalesOrderEdit,
  SalesOrderEditListItem,
} from "../entities/SalesOrderEdit";


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

export interface GetSalesOrderEditsParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ISalesOrderRepository {
  getAll(params?: GetSalesOrdersParams): Promise<PaginatedResult<SalesOrder>>;
  getById(id: string): Promise<SalesOrder | null>;
  create(data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">): Promise<SalesOrder>;
  update(
    id: string,
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[], preview: boolean): Promise<BulkDeleteResult>;
  getEdits(id: string): Promise<SalesOrderEdit[]>;
  getAllEdits(
    params?: GetSalesOrderEditsParams
  ): Promise<PaginatedResult<SalesOrderEditListItem>>;
}

