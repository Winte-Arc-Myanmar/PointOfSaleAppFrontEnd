import type { Id } from "@/core/domain/types";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIAL"
  | "RECEIVED"
  | "CANCELLED"
  | string;

export interface PurchaseOrder {
  id: Id;
  tenantId: string;
  requisitionId: string;
  vendorId: string;
  poNumber: string;
  currency: string;
  expectedDeliveryDate: string;
  status: PurchaseOrderStatus;
  totalAmount: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
