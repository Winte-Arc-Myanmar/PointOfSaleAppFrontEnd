import type { Id } from "@/core/domain/types";

export interface GrnLine {
  id: Id;
  grnId: string;
  poLineId: string;
  productId: string;
  receivedQuantity: string;
  acceptedQuantity: string;
  rejectedQuantity: string;
  inventoryLedgerPosted: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}
