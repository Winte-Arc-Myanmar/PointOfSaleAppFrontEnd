import type {
  KitchenPrinterCreateDto,
  KitchenPrinterUpdateDto,
} from "@/core/application/dtos/KitchenPrinterDto";
import type { KitchenPrinter } from "../entities/KitchenPrinter";
import type { GetKitchenPrintersParams } from "../repositories/IKitchenPrinterRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IKitchenPrinterService {
  getAll(params?: GetKitchenPrintersParams): Promise<PaginatedResult<KitchenPrinter>>;
  getById(id: string): Promise<KitchenPrinter | null>;
  create(data: KitchenPrinterCreateDto): Promise<KitchenPrinter>;
  update(id: string, data: KitchenPrinterUpdateDto): Promise<KitchenPrinter>;
  delete(id: string): Promise<void>;
  attachCategory(printerId: string, categoryId: string): Promise<void>;
  detachCategory(printerId: string, categoryId: string): Promise<void>;
}
