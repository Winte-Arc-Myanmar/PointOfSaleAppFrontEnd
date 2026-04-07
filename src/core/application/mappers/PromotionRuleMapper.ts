import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import type { PromotionRuleDto } from "../dtos/PromotionRuleDto";

export function toPromotionRule(dto: PromotionRuleDto & { id: string }): PromotionRule {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    eligibilityCriteria: dto.eligibilityCriteria ?? {},
    rewardAction: dto.rewardAction ?? { type: "", value: 0 },
    priorityLevel: typeof dto.priorityLevel === "number" ? dto.priorityLevel : Number(dto.priorityLevel) || 0,
    isStackable: !!dto.isStackable,
    startDate: dto.startDate ?? "",
    endDate: dto.endDate ?? "",
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toPromotionRuleDto(rule: Partial<PromotionRule>): PromotionRuleDto {
  return {
    ...(rule.id && { id: rule.id }),
    tenantId: rule.tenantId ?? "",
    name: rule.name ?? "",
    eligibilityCriteria: rule.eligibilityCriteria ?? {},
    rewardAction: rule.rewardAction ?? { type: "PERCENTAGE_DISCOUNT", value: 0 },
    priorityLevel: rule.priorityLevel ?? 0,
    isStackable: rule.isStackable ?? false,
    startDate: rule.startDate ?? new Date().toISOString(),
    endDate: rule.endDate ?? new Date().toISOString(),
  };
}

