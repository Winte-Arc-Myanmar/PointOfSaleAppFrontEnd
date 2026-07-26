import type { Id } from "@/core/domain/types";

export type TransferOrderStatus =
  | "DRAFT"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "CANCELLED"
  | string;

export interface TransferOrder {
  id: Id;
  tenantId: string;
  sourceLocationId: string;
  transitLocationId: string;
  destinationLocationId: string;
  transferNumber: string;
  status: TransferOrderStatus;
  shippedAt?: string | null;
  receivedAt?: string | null;
  createdBy: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
