import type { Id } from "@/core/domain/types";

export type PricingAdjustmentType =
  | "PERCENT_OFF"
  | "AMOUNT_OFF"
  | "FIXED_PRICE"
  | string;

export interface PricingRule {
  id?: Id;
  pricingScheduleId?: string;
  variantId?: string | null;
  categoryId?: string | null;
  adjustmentType: PricingAdjustmentType;
  adjustmentValue: number;
}

export interface PricingSchedule {
  id: Id;
  tenantId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  priority: number;
  isActive: boolean;
  rules?: PricingRule[];
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
