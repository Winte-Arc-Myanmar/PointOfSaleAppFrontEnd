import type { PurchaseOrder } from "@/core/domain/entities/PurchaseOrder";
import type { PurchaseOrderDto } from "../dtos/PurchaseOrderDto";

export function toPurchaseOrder(
  dto: PurchaseOrderDto & { id: string },
): PurchaseOrder {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    requisitionId: dto.requisitionId ?? "",
    vendorId: dto.vendorId ?? "",
    poNumber: dto.poNumber ?? "",
    currency: dto.currency ?? "USD",
    expectedDeliveryDate: dto.expectedDeliveryDate ?? "",
    status: dto.status ?? "DRAFT",
    totalAmount: dto.totalAmount ?? "0.00",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toPurchaseOrderDto(
  item: Partial<PurchaseOrder>,
): PurchaseOrderDto {
  return {
    ...(item.id && { id: String(item.id) }),
    tenantId: item.tenantId ?? "",
    requisitionId: item.requisitionId ?? "",
    vendorId: item.vendorId ?? "",
    poNumber: item.poNumber ?? "",
    currency: item.currency ?? "USD",
    expectedDeliveryDate: item.expectedDeliveryDate ?? "",
    totalAmount: item.totalAmount ?? "0.00",
  };
}
