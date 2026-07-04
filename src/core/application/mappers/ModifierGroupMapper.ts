import type {
  ModifierGroupDto,
  ModifierDto,
} from "@/core/application/dtos/ModifierGroupDto";
import type {
  Modifier,
  ModifierGroup,
} from "@/core/domain/entities/ModifierGroup";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toModifierGroup(dto: ModifierGroupDto & { id: string }): ModifierGroup {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    minSelection: toNumber(dto.minSelection),
    maxSelection: toNumber(dto.maxSelection),
    isRequired: Boolean(dto.isRequired),
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toModifier(dto: ModifierDto & { id: string }): Modifier {
  return {
    id: dto.id,
    modifierGroupId: dto.modifierGroupId ?? "",
    name: dto.name ?? "",
    priceDelta: dto.priceDelta ?? "0.0000",
    sortOrder: toNumber(dto.sortOrder),
    isDefault: Boolean(dto.isDefault),
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
