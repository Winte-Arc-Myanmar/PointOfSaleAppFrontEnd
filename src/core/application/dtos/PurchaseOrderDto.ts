import type { PurchaseOrderStatus } from "@/core/domain/entities/PurchaseOrder";

export interface PurchaseOrderDto {
  id?: string;
  tenantId: string;
  requisitionId: string;
  vendorId: string;
  poNumber: string;
  currency: string;
  expectedDeliveryDate: string;
  status?: PurchaseOrderStatus;
  totalAmount: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
