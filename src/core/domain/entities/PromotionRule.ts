import type { Id } from "@/core/domain/types";
import type { PosType } from "@/core/domain/entities/PosReport";

/** FREE_TIME gives time instead of money off: buy some hours, get more free. */
export type PromotionDiscountType = "PERCENT_OFF" | "AMOUNT_OFF" | "FREE_TIME";
export type PromotionScope = "ALL_ITEMS" | "CATEGORIES" | "ITEMS";
/** The groups an "everything" promotion can be narrowed to, as the products page tabs show them. */
export type PromotionGroup = "FOOD_DRINK" | "HOSTESS" | "SPA_PACKAGE" | "ROOM_TIME";

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
  /** FREE_TIME: every buyUnits bought gives freeUnits more. */
  buyUnits: number | null;
  freeUnits: number | null;
  appliesTo: PromotionScope;
  /** ALL_ITEMS: only these groups; empty means everything sold. */
  productGroups: PromotionGroup[];
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
