import type { VendorInvoice } from "../entities/VendorInvoice";
import type { VendorInvoiceDto } from "@/core/application/dtos/VendorInvoiceDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetVendorInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type VendorInvoiceWriteDto = Omit<
  VendorInvoiceDto,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export interface IVendorInvoiceRepository {
  getAll(
    params?: GetVendorInvoicesParams,
  ): Promise<PaginatedResult<VendorInvoice>>;
  getById(id: string): Promise<VendorInvoice | null>;
  create(data: VendorInvoiceWriteDto): Promise<VendorInvoice>;
  update(id: string, data: VendorInvoiceWriteDto): Promise<VendorInvoice>;
  delete(id: string): Promise<void>;
}
