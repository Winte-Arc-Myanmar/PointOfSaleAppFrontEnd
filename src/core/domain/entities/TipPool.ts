import type { Id } from "@/core/domain/types";

export type TipPoolStatus = "OPEN" | "SETTLED" | string;
export type TipPoolDistributionMethod =
  | "EQUAL"
  | "BY_HOURS"
  | "MANUAL"
  | string;

export interface TipPool {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  distributionMethod: TipPoolDistributionMethod;
  totalTips: string;
  totalServiceCharge: string;
  includeServiceCharge: boolean;
  serviceChargeShareBps: number;
  totalDistributable: string;
  status: TipPoolStatus;
  settledAt?: string | null;
  settledBy?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TipPoolAllocation {
  id: Id;
  poolId: string;
  userId: string;
  role: string;
  hoursWorked: string;
  weight: string;
  amount: string;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
