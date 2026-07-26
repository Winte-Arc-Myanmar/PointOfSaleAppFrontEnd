import type { LandedCostAllocationMethod } from "@/core/domain/entities/LandedCostAllocation";

export interface LandedCostAllocationDto {
  id?: string;
  tenantId: string;
  sourceInvoiceId: string;
  targetGrnId: string;
  targetGrnLineId: string;
  allocationMethod: LandedCostAllocationMethod;
  allocatedAmount: string;
  glJournalPosted: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}
