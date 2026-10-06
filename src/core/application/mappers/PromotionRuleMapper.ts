import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import type { PromotionRuleDto } from "../dtos/PromotionRuleDto";

export function toPromotionRule(dto: PromotionRuleDto & { id: string }): PromotionRule {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    discountType: dto.discountType ?? "PERCENT_OFF",
    discountValue: Number(dto.discountValue) || 0,
    buyUnits: dto.buyUnits ?? null,
    freeUnits: dto.freeUnits ?? null,
    appliesTo: dto.appliesTo ?? "ALL_ITEMS",
    categoryIds: dto.categoryIds ?? [],
    variantIds: dto.variantIds ?? [],
    items: dto.items ?? [],
    posTypes: dto.posTypes ?? [],
    locationIds: dto.locationIds ?? [],
    startsOn: dto.startsOn ?? null,
    endsOn: dto.endsOn ?? null,
    daysOfWeek: dto.daysOfWeek ?? [],
    startTime: dto.startTime ?? null,
    endTime: dto.endTime ?? null,
    priorityLevel: Number(dto.priorityLevel) || 0,
    isActive: dto.isActive !== false,
    runningNow: !!dto.runningNow,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
