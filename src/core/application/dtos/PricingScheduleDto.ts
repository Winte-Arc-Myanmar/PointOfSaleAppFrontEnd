import type { PricingAdjustmentType } from "@/core/domain/entities/PricingSchedule";

export interface PricingRuleDto {
  id?: string;
  pricingScheduleId?: string;
  variantId?: string | null;
  categoryId?: string | null;
  adjustmentType: PricingAdjustmentType;
  adjustmentValue: number;
}

export interface PricingScheduleDto {
  id?: string;
  tenantId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  priority: number;
  isActive: boolean;
  rules?: PricingRuleDto[];
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type PricingRuleInputDto = Pick<
  PricingRuleDto,
  "variantId" | "categoryId" | "adjustmentType" | "adjustmentValue"
>;

export type PricingScheduleCreateDto = Pick<
  PricingScheduleDto,
  | "tenantId"
  | "name"
  | "startsAt"
  | "endsAt"
  | "daysOfWeek"
  | "startTime"
  | "endTime"
  | "priority"
  | "isActive"
> & {
  rules: PricingRuleInputDto[];
};

export type PricingScheduleUpdateDto = {
  name?: string;
  startsAt?: string;
  endsAt?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  priority?: number;
  isActive?: boolean;
  rules?: PricingRuleInputDto[];
};
