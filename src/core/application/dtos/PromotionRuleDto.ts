import type {
  PromotionDiscountType,
  PromotionScope,
} from "@/core/domain/entities/PromotionRule";
import type { PosType } from "@/core/domain/entities/PosReport";

export interface PromotionRuleDto {
  id?: string;
  tenantId: string;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: string | number;
  appliesTo: PromotionScope;
  categoryIds?: string[];
  variantIds?: string[];
  items?: { variantId: string; name: string }[];
  posTypes?: PosType[];
  locationIds?: string[];
  startsOn?: string | null;
  endsOn?: string | null;
  daysOfWeek?: number[];
  startTime?: string | null;
  endTime?: string | null;
  priorityLevel?: number;
  isActive?: boolean;
  runningNow?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** What the admin sends to create or change a promotion. */
export interface PromotionRuleInput {
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  appliesTo: PromotionScope;
  categoryIds: string[];
  variantIds: string[];
  posTypes: PosType[];
  locationIds: string[];
  startsOn: string | null;
  endsOn: string | null;
  daysOfWeek: number[];
  startTime: string | null;
  endTime: string | null;
  priorityLevel: number;
  isActive: boolean;
}
