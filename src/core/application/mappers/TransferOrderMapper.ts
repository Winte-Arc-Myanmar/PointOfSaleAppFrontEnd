import type { TransferOrder } from "@/core/domain/entities/TransferOrder";
import type { TransferOrderDto } from "../dtos/TransferOrderDto";

export function toTransferOrder(
  dto: TransferOrderDto & { id: string },
): TransferOrder {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    sourceLocationId: dto.sourceLocationId ?? "",
    transitLocationId: dto.transitLocationId ?? "",
    destinationLocationId: dto.destinationLocationId ?? "",
    transferNumber: dto.transferNumber ?? "",
    status: dto.status ?? "DRAFT",
    shippedAt: dto.shippedAt ?? null,
    receivedAt: dto.receivedAt ?? null,
    createdBy: dto.createdBy ?? "",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toTransferOrderDto(
  order: Partial<TransferOrder>,
): TransferOrderDto {
  return {
    ...(order.id && { id: String(order.id) }),
    tenantId: order.tenantId ?? "",
    sourceLocationId: order.sourceLocationId ?? "",
    transitLocationId: order.transitLocationId ?? "",
    destinationLocationId: order.destinationLocationId ?? "",
    transferNumber: order.transferNumber ?? "",
    createdBy: order.createdBy ?? "",
  };
}
