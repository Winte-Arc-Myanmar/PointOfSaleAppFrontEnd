import type {
  VendorInvoiceStatus,
  VendorInvoiceType,
} from "@/core/domain/entities/VendorInvoice";

export interface VendorInvoiceDto {
  id?: string;
  tenantId: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceType: VendorInvoiceType;
  matchedPoId: string;
  matchedGrnId: string;
  totalAmount: string;
  status?: VendorInvoiceStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
