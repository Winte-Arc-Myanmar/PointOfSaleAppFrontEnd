import type { VendorInvoice } from "../entities/VendorInvoice";
import type {
  GetVendorInvoicesParams,
  VendorInvoiceWriteDto,
} from "../repositories/IVendorInvoiceRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IVendorInvoiceService {
  getAll(
    params?: GetVendorInvoicesParams,
  ): Promise<PaginatedResult<VendorInvoice>>;
  getById(id: string): Promise<VendorInvoice | null>;
  create(data: VendorInvoiceWriteDto): Promise<VendorInvoice>;
  update(id: string, data: VendorInvoiceWriteDto): Promise<VendorInvoice>;
  delete(id: string): Promise<void>;
}
