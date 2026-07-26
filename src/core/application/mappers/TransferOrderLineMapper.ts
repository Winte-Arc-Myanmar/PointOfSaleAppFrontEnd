import type { TransferOrderLine } from "@/core/domain/entities/TransferOrderLine";
import type { TransferOrderLineDto } from "../dtos/TransferOrderLineDto";

export function toTransferOrderLine(
  transferOrderId: string,
  dto: TransferOrderLineDto & { id: string },
): TransferOrderLine {
  return {
    id: dto.id,
    transferOrderId: dto.transferOrderId ?? transferOrderId,
    productId: dto.productId ?? "",
    requestedQuantity: dto.requestedQuantity ?? "0.0000",
    shippedQuantity: dto.shippedQuantity ?? "0.0000",
    receivedQuantity: dto.receivedQuantity ?? "0.0000",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toTransferOrderLineDto(
  line: Partial<TransferOrderLine>,
): TransferOrderLineDto {
  return {
    ...(line.id && { id: String(line.id) }),
    productId: line.productId ?? "",
    requestedQuantity: line.requestedQuantity ?? "0.0000",
    shippedQuantity: line.shippedQuantity ?? "0.0000",
    receivedQuantity: line.receivedQuantity ?? "0.0000",
  };
}
