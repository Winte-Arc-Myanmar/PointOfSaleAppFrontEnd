import type { GrnLine } from "@/core/domain/entities/GrnLine";
import type { GrnLineDto } from "../dtos/GrnLineDto";

export function toGrnLine(
  grnId: string,
  dto: GrnLineDto & { id: string },
): GrnLine {
  return {
    id: dto.id,
    grnId: dto.grnId ?? grnId,
    poLineId: dto.poLineId ?? "",
    productId: dto.productId ?? "",
    receivedQuantity: dto.receivedQuantity ?? "0.0000",
    acceptedQuantity: dto.acceptedQuantity ?? "0.0000",
    rejectedQuantity: dto.rejectedQuantity ?? "0.0000",
    inventoryLedgerPosted: Boolean(dto.inventoryLedgerPosted),
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toGrnLineDto(line: Partial<GrnLine>): GrnLineDto {
  return {
    ...(line.id && { id: String(line.id) }),
    poLineId: line.poLineId ?? "",
    productId: line.productId ?? "",
    receivedQuantity: line.receivedQuantity ?? "0.0000",
    acceptedQuantity: line.acceptedQuantity ?? "0.0000",
    rejectedQuantity: line.rejectedQuantity ?? "0.0000",
    inventoryLedgerPosted: Boolean(line.inventoryLedgerPosted),
  };
}
