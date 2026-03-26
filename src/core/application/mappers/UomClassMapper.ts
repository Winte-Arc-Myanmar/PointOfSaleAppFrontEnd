/**
 * UOM Class entity <-> DTO mappers.
 * Application layer.
 */

import type { UomClass } from "@/core/domain/entities/UomClass";
import type { UomClassDto } from "../dtos/UomClassDto";

export function toUomClass(dto: UomClassDto & { id: string }): UomClass {
  return {
    id: dto.id,
    name: dto.name ?? "",
    tenantId: dto.tenantId ?? "",
  };
}

export function toUomClassDto(uomClass: Partial<UomClass>): UomClassDto {
  return {
    ...(uomClass.id && { id: uomClass.id }),
    name: uomClass.name ?? "",
    tenantId: uomClass.tenantId ?? "",
  };
}
