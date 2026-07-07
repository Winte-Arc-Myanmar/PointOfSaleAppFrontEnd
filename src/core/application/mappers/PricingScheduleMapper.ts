import type {
  PricingRuleDto,
  PricingScheduleDto,
} from "@/core/application/dtos/PricingScheduleDto";
import type {
  PricingRule,
  PricingSchedule,
} from "@/core/domain/entities/PricingSchedule";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toRule(dto: PricingRuleDto): PricingRule {
  return {
    id: dto.id,
    pricingScheduleId: dto.pricingScheduleId,
    variantId: dto.variantId ?? null,
    categoryId: dto.categoryId ?? null,
    adjustmentType: dto.adjustmentType ?? "PERCENT_OFF",
    adjustmentValue: toNumber(dto.adjustmentValue),
  };
}

export function toPricingSchedule(
  dto: PricingScheduleDto & { id: string },
): PricingSchedule {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    startsAt: dto.startsAt ?? "",
    endsAt: dto.endsAt ?? "",
    daysOfWeek: Array.isArray(dto.daysOfWeek) ? dto.daysOfWeek : [],
    startTime: dto.startTime ?? "",
    endTime: dto.endTime ?? "",
    priority: toNumber(dto.priority),
    isActive: Boolean(dto.isActive),
    rules: Array.isArray(dto.rules) ? dto.rules.map((item) => toRule(item)) : [],
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
