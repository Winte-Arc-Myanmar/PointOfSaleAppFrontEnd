import type {
  TipPoolDistributionMethod,
  TipPoolStatus,
} from "@/core/domain/entities/TipPool";

export interface TipPoolDto {
  id?: string;
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

export type TipPoolCreateDto = Pick<
  TipPoolDto,
  | "tenantId"
  | "locationId"
  | "name"
  | "periodStart"
  | "periodEnd"
  | "distributionMethod"
  | "includeServiceCharge"
  | "serviceChargeShareBps"
  | "notes"
>;

export type TipPoolUpdateDto = Pick<
  TipPoolDto,
  | "name"
  | "periodStart"
  | "periodEnd"
  | "distributionMethod"
  | "includeServiceCharge"
  | "serviceChargeShareBps"
  | "notes"
>;

export interface TipPoolAllocationDto {
  id?: string;
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

export interface TipPoolCreateAllocationDto {
  userId: string;
  role: string;
  hoursWorked?: number;
  weight?: number;
  amount?: number;
  notes?: string | null;
}

export interface TipPoolUpdateAllocationDto {
  role?: string;
  hoursWorked?: number;
  weight?: number;
  amount?: number;
  notes?: string | null;
}
