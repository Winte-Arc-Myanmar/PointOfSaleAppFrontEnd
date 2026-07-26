import type { PurchaseRequisitionStatus } from "@/core/domain/entities/PurchaseRequisition";

export interface PurchaseRequisitionDto {
  id?: string;
  tenantId: string;
  requestedBy: string;
  department: string;
  justification: string;
  status?: PurchaseRequisitionStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
