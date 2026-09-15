import type { CardTier } from "@/core/domain/entities/CardTier";
import type { CardTierDto, CardTierWriteDto } from "../dtos/CardTierDto";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function toPreloadAmountString(value: number | string): string {
  return toNumber(value).toFixed(4);
}

export function toCardTier(dto: CardTierDto & { id: string }): CardTier {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    rank: toNumber(dto.rank),
    preloadAmount: toNumber(dto.preloadAmount),
    preloadFunding: dto.preloadFunding ?? "PURCHASED",
    discountBps: toNumber(dto.discountBps),
    isPostpaid: Boolean(dto.isPostpaid),
    validityDays: toNumber(dto.validityDays),
    isActive: dto.isActive !== false,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toCardTierWriteDto(
  tier: Pick<
    CardTier,
    | "name"
    | "rank"
    | "preloadAmount"
    | "preloadFunding"
    | "discountBps"
    | "isPostpaid"
    | "validityDays"
    | "isActive"
  >,
): CardTierWriteDto {
  return {
    name: tier.name.trim(),
    rank: toNumber(tier.rank),
    preloadAmount: toPreloadAmountString(tier.preloadAmount),
    preloadFunding: tier.preloadFunding || "PURCHASED",
    discountBps: toNumber(tier.discountBps),
    isPostpaid: Boolean(tier.isPostpaid),
    validityDays: toNumber(tier.validityDays),
    isActive: Boolean(tier.isActive),
  };
}
