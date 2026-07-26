import type { Id } from "@/core/domain/types";

export type PurchaseRequisitionStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | string;

export interface PurchaseRequisition {
  id: Id;
  tenantId: string;
  requestedBy: string;
  department: string;
  justification: string;
  status: PurchaseRequisitionStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
