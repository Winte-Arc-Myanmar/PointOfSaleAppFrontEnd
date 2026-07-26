import type { GoodsReceivedNoteStatus } from "@/core/domain/entities/GoodsReceivedNote";

export interface GoodsReceivedNoteDto {
  id?: string;
  tenantId: string;
  purchaseOrderId: string;
  receivingLocationId: string;
  grnNumber: string;
  receivedBy: string;
  receivedAt?: string | null;
  status?: GoodsReceivedNoteStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
