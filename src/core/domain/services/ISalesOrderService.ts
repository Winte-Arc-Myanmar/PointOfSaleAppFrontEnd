import type { SalesOrder } from "../entities/SalesOrder";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";
import type {
  GetSalesOrderEditsParams,
  GetSalesOrdersParams,
} from "../repositories/ISalesOrderRepository";
import type { PaginatedResult } from "../types/pagination";
import type {
  SalesOrderEdit,
  SalesOrderEditListItem,
} from "../entities/SalesOrderEdit";


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
  getEdits(id: string): Promise<SalesOrderEdit[]>;
  getAllEdits(
    params?: GetSalesOrderEditsParams
  ): Promise<PaginatedResult<SalesOrderEditListItem>>;
}

