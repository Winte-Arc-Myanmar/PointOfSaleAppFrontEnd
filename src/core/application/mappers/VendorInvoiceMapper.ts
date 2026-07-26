import type { VendorInvoice } from "@/core/domain/entities/VendorInvoice";
import type { VendorInvoiceDto } from "../dtos/VendorInvoiceDto";

export function toVendorInvoice(
  dto: VendorInvoiceDto & { id: string },
): VendorInvoice {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    vendorId: dto.vendorId ?? "",
    invoiceNumber: dto.invoiceNumber ?? "",
    invoiceType: dto.invoiceType ?? "STANDARD",
    matchedPoId: dto.matchedPoId ?? "",
    matchedGrnId: dto.matchedGrnId ?? "",
    totalAmount: dto.totalAmount ?? "0.00",
    status: dto.status ?? "UNPAID",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toVendorInvoiceDto(
  item: Partial<VendorInvoice>,
): VendorInvoiceDto {
  return {
    ...(item.id && { id: String(item.id) }),
    tenantId: item.tenantId ?? "",
    vendorId: item.vendorId ?? "",
    invoiceNumber: item.invoiceNumber ?? "",
    invoiceType: item.invoiceType ?? "STANDARD",
    matchedPoId: item.matchedPoId ?? "",
    matchedGrnId: item.matchedGrnId ?? "",
    totalAmount: item.totalAmount ?? "0.00",
  };
}
