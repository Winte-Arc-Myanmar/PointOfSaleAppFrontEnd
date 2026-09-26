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

function resolveTenantId(dto: CardTierDto & Record<string, unknown>): string {
  if (typeof dto.tenantId === "string" && dto.tenantId.trim()) return dto.tenantId.trim();
  if (typeof dto.tenantId === "number" && Number.isFinite(dto.tenantId)) {
    return String(dto.tenantId);
  }
  const tenant_id = dto.tenant_id;
  if (typeof tenant_id === "string" && tenant_id.trim()) return tenant_id.trim();
  if (typeof tenant_id === "number" && Number.isFinite(tenant_id)) {
    return String(tenant_id);
  }
  if (typeof dto.tenant === "string" && dto.tenant.trim()) return dto.tenant.trim();
  const tenant = dto.tenant;
  if (tenant && typeof tenant === "object" && tenant !== null && "id" in tenant) {
    const id = (tenant as { id?: unknown }).id;
    if (id != null && String(id).trim()) return String(id).trim();
  }
  return "";
}

function resolveIsActive(dto: CardTierDto & Record<string, unknown>): boolean {
  if (dto.isActive === false) return false;
  if (dto.isActive === true) return true;
  const isActiveSnake = dto.is_active;
  if (isActiveSnake === false) return false;
  if (isActiveSnake === true) return true;
  if (dto.active === false) return false;
  if (dto.active === true) return true;
  const status = dto.status;
  if (typeof status === "string") {
    const normalized = status.trim().toUpperCase();
    if (normalized === "INACTIVE" || normalized === "DISABLED") return false;
    if (normalized === "ACTIVE") return true;
  }
  return dto.isActive !== false;
}

export function toCardTier(dto: CardTierDto & { id: string }): CardTier {
  const raw = dto as CardTierDto & Record<string, unknown>;
  return {
    id: dto.id,
    tenantId: resolveTenantId(raw),
    name: dto.name ?? "",
    rank: toNumber(dto.rank),
    preloadAmount: toNumber(dto.preloadAmount),
    preloadFunding: dto.preloadFunding ?? "PURCHASED",
    discountBps: toNumber(dto.discountBps),
    isPostpaid: Boolean(dto.isPostpaid),
    validityDays: toNumber(dto.validityDays),
    isActive: resolveIsActive(raw),
    deletedAt:
      dto.deletedAt ??
      (typeof raw.deleted_at === "string" ? raw.deleted_at : null),
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
