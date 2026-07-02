import type { KdsStation } from "@/core/domain/entities/KdsStation";
import type { KdsStationDto } from "../dtos/KdsStationDto";

export function toKdsStation(dto: KdsStationDto & { id: string }): KdsStation {
  const categoryIds = Array.isArray(dto.routingRules?.categoryIds)
    ? dto.routingRules.categoryIds.filter(Boolean).map(String)
    : [];

  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    displayColor: dto.displayColor ?? "#FF5733",
    routingRules: { categoryIds },
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
