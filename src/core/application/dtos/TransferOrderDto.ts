import type { TransferOrderStatus } from "@/core/domain/entities/TransferOrder";

export interface TransferOrderDto {
  id?: string;
  tenantId: string;
  sourceLocationId: string;
  transitLocationId: string;
  destinationLocationId: string;
  transferNumber: string;
  status?: TransferOrderStatus;
  shippedAt?: string | null;
  receivedAt?: string | null;
  createdBy: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
