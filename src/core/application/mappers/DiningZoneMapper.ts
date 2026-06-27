import type { DiningZone } from "@/core/domain/entities/DiningZone";
import type { DiningZoneDto } from "../dtos/DiningZoneDto";

export function toDiningZone(dto: DiningZoneDto & { id: string }): DiningZone {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    layoutSvg: dto.layoutSvg ?? "",
    sortOrder: Number(dto.sortOrder) || 0,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toDiningZoneDto(zone: Partial<DiningZone>): DiningZoneDto {
  return {
    ...(zone.id && { id: String(zone.id) }),
    tenantId: zone.tenantId ?? "",
    name: zone.name ?? "",
    layoutSvg: zone.layoutSvg ?? "",
    sortOrder: zone.sortOrder ?? 0,
    deletedAt: zone.deletedAt ?? null,
    createdAt: zone.createdAt ?? null,
    updatedAt: zone.updatedAt ?? null,
  };
}
