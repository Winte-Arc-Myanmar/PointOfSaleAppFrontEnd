/**
 * DTOs for promotion rule API request/response.
 * Application layer - matches backend contract.
 */

export interface PromotionRewardActionDto {
  type: string;
  value: number;
}

export interface PromotionRuleDto {
  id?: string;
  tenantId: string;
  name: string;
  eligibilityCriteria: Record<string, unknown>;
  rewardAction: PromotionRewardActionDto;
  priorityLevel: number;
  isStackable: boolean;
  startDate: string;
  endDate: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

