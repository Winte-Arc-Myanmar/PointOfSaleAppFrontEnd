import type { TipPoolDto, TipPoolAllocationDto } from "@/core/application/dtos/TipPoolDto";
import type { TipPool, TipPoolAllocation } from "@/core/domain/entities/TipPool";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toTipPool(dto: TipPoolDto & { id: string }): TipPool {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    periodStart: dto.periodStart ?? "",
    periodEnd: dto.periodEnd ?? "",
    distributionMethod: dto.distributionMethod ?? "BY_HOURS",
    totalTips: dto.totalTips ?? "0.0000",
    totalServiceCharge: dto.totalServiceCharge ?? "0.0000",
    includeServiceCharge: Boolean(dto.includeServiceCharge),
    serviceChargeShareBps: toNumber(dto.serviceChargeShareBps, 0),
    totalDistributable: dto.totalDistributable ?? "0.0000",
    status: dto.status ?? "OPEN",
    settledAt: dto.settledAt ?? null,
    settledBy: dto.settledBy ?? null,
    notes: dto.notes ?? null,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toTipPoolAllocation(
  dto: TipPoolAllocationDto & { id: string },
): TipPoolAllocation {
  return {
    id: dto.id,
    poolId: dto.poolId ?? "",
    userId: dto.userId ?? "",
    role: dto.role ?? "",
    hoursWorked: dto.hoursWorked ?? "0.00",
    weight: dto.weight ?? "0.0000",
    amount: dto.amount ?? "0.0000",
    notes: dto.notes ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
