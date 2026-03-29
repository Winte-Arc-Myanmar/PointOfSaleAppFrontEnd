/**
 * Location entity <-> DTO mappers.
 */

import type { Location, LocationTreeNode } from "@/core/domain/entities/Location";
import type { LocationDto } from "../dtos/LocationDto";

export function toLocation(dto: LocationDto & { id: string }): Location {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    parentLocationId: dto.parentLocationId ?? null,
    name: dto.name ?? "",
    type: dto.type ?? "",
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toLocationTreeNode(
  dto: LocationDto & { id: string }
): LocationTreeNode {
  const base = toLocation(dto);
  const children = dto.subLocations
    ?.filter((s): s is LocationDto & { id: string } => !!s?.id)
    .map(toLocationTreeNode);
  if (children && children.length > 0) return { ...base, subLocations: children };
  return { ...base };
}
