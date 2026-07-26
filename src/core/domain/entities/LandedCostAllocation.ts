import type { Id } from "@/core/domain/types";

export type LandedCostAllocationMethod =
  | "BY_VALUE"
  | "BY_QUANTITY"
  | "BY_WEIGHT"
  | string;

export interface LandedCostAllocation {
  id: Id;
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
