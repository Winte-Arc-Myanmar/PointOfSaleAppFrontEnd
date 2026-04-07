import type { Id } from "@/core/domain/types";

export interface PromotionRewardAction {
  type: string;
  value: number;
}

export interface PromotionRule {
  id: Id;
  tenantId: string;
  name: string;
  eligibilityCriteria: Record<string, unknown>;
  rewardAction: PromotionRewardAction;
  priorityLevel: number;
  isStackable: boolean;
  startDate: string;
  endDate: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

