import type {
  KitchenPrinterCreateDto,
  KitchenPrinterUpdateDto,
} from "@/core/application/dtos/KitchenPrinterDto";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";
import type {
  GetKitchenPrintersParams,
  IKitchenPrinterRepository,
} from "@/core/domain/repositories/IKitchenPrinterRepository";
import type { IKitchenPrinterService } from "@/core/domain/services/IKitchenPrinterService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class KitchenPrinterService implements IKitchenPrinterService {
  constructor(private readonly kitchenPrinterRepository: IKitchenPrinterRepository) {}

  getAll(params?: GetKitchenPrintersParams): Promise<PaginatedResult<KitchenPrinter>> {
    return this.kitchenPrinterRepository.getAll(params);
  }

  getById(id: string): Promise<KitchenPrinter | null> {
    return this.kitchenPrinterRepository.getById(id);
  }

  create(data: KitchenPrinterCreateDto): Promise<KitchenPrinter> {
    return this.kitchenPrinterRepository.create(data);
  }

  update(id: string, data: KitchenPrinterUpdateDto): Promise<KitchenPrinter> {
    return this.kitchenPrinterRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.kitchenPrinterRepository.delete(id);
  }

  attachCategory(printerId: string, categoryId: string): Promise<void> {
    return this.kitchenPrinterRepository.attachCategory(printerId, categoryId);
  }

  detachCategory(printerId: string, categoryId: string): Promise<void> {
    return this.kitchenPrinterRepository.detachCategory(printerId, categoryId);
  }
}
