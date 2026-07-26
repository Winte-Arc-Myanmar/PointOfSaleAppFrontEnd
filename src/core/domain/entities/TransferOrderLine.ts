import type { Id } from "@/core/domain/types";

export interface TransferOrderLine {
  id: Id;
  transferOrderId: string;
  productId: string;
  requestedQuantity: string;
  shippedQuantity: string;
  receivedQuantity: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
