import type { GoodsReceivedNote } from "@/core/domain/entities/GoodsReceivedNote";
import type { GoodsReceivedNoteDto } from "../dtos/GoodsReceivedNoteDto";

export function toGoodsReceivedNote(
  dto: GoodsReceivedNoteDto & { id: string },
): GoodsReceivedNote {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    purchaseOrderId: dto.purchaseOrderId ?? "",
    receivingLocationId: dto.receivingLocationId ?? "",
    grnNumber: dto.grnNumber ?? "",
    receivedBy: dto.receivedBy ?? "",
    receivedAt: dto.receivedAt ?? null,
    status: dto.status ?? "INSPECTING",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toGoodsReceivedNoteDto(
  item: Partial<GoodsReceivedNote>,
): GoodsReceivedNoteDto {
  return {
    ...(item.id && { id: String(item.id) }),
    tenantId: item.tenantId ?? "",
    purchaseOrderId: item.purchaseOrderId ?? "",
    receivingLocationId: item.receivingLocationId ?? "",
    grnNumber: item.grnNumber ?? "",
    receivedBy: item.receivedBy ?? "",
  };
}
