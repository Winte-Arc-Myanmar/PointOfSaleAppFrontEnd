import type { IVendorInvoiceService } from "@/core/domain/services/IVendorInvoiceService";
import type { IVendorInvoiceRepository } from "@/core/domain/repositories/IVendorInvoiceRepository";
import type { VendorInvoice } from "@/core/domain/entities/VendorInvoice";
import type {
  GetVendorInvoicesParams,
  VendorInvoiceWriteDto,
} from "@/core/domain/repositories/IVendorInvoiceRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class VendorInvoiceService implements IVendorInvoiceService {
  constructor(
    private readonly vendorInvoiceRepository: IVendorInvoiceRepository,
  ) {}

  getAll(
    params?: GetVendorInvoicesParams,
  ): Promise<PaginatedResult<VendorInvoice>> {
    return this.vendorInvoiceRepository.getAll(params);
  }

  getById(id: string): Promise<VendorInvoice | null> {
    return this.vendorInvoiceRepository.getById(id);
  }

  create(data: VendorInvoiceWriteDto): Promise<VendorInvoice> {
    return this.vendorInvoiceRepository.create(data);
  }

  update(id: string, data: VendorInvoiceWriteDto): Promise<VendorInvoice> {
    return this.vendorInvoiceRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.vendorInvoiceRepository.delete(id);
  }
}
