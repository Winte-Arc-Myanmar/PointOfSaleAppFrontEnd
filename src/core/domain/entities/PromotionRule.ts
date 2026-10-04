import type { Id } from "@/core/domain/types";
import type { PosType } from "@/core/domain/entities/PosReport";

export type PromotionDiscountType = "PERCENT_OFF" | "AMOUNT_OFF";
export type PromotionScope = "ALL_ITEMS" | "CATEGORIES" | "ITEMS";

export interface PromotionItem {
  variantId: string;
  name: string;
}

export interface PromotionRule {
  id: Id;
  tenantId: string;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  appliesTo: PromotionScope;
  categoryIds: string[];
  variantIds: string[];
  items: PromotionItem[];
  posTypes: PosType[];
  locationIds: string[];
  startsOn: string | null;
  endsOn: string | null;
  daysOfWeek: number[];
  startTime: string | null;
  endTime: string | null;
  priorityLevel: number;
  isActive: boolean;
  runningNow: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}
