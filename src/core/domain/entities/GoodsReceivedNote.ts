import type { Id } from "@/core/domain/types";

export type GoodsReceivedNoteStatus =
  | "INSPECTING"
  | "ACCEPTED"
  | "REJECTED"
  | "POSTED"
  | string;

export interface GoodsReceivedNote {
  id: Id;
  tenantId: string;
  purchaseOrderId: string;
  receivingLocationId: string;
  grnNumber: string;
  receivedBy: string;
  receivedAt?: string | null;
  status: GoodsReceivedNoteStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
