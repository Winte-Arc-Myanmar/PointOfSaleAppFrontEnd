import type { Id } from "@/core/domain/types";

export type VendorInvoiceType = "STANDARD" | "LANDED_COST" | "CREDIT" | string;

export type VendorInvoiceStatus =
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "VOID"
  | string;

export interface VendorInvoice {
  id: Id;
  tenantId: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceType: VendorInvoiceType;
  matchedPoId: string;
  matchedGrnId: string;
  totalAmount: string;
  status: VendorInvoiceStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
