import type {
  KitchenPrinterCreateDto,
  KitchenPrinterUpdateDto,
} from "@/core/application/dtos/KitchenPrinterDto";
import type { KitchenPrinter } from "../entities/KitchenPrinter";
import type { PaginatedResult } from "../types/pagination";

export interface GetKitchenPrintersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IKitchenPrinterRepository {
  getAll(params?: GetKitchenPrintersParams): Promise<PaginatedResult<KitchenPrinter>>;
  getById(id: string): Promise<KitchenPrinter | null>;
  create(data: KitchenPrinterCreateDto): Promise<KitchenPrinter>;
  update(id: string, data: KitchenPrinterUpdateDto): Promise<KitchenPrinter>;
  delete(id: string): Promise<void>;
  attachCategory(printerId: string, categoryId: string): Promise<void>;
  detachCategory(printerId: string, categoryId: string): Promise<void>;
}
