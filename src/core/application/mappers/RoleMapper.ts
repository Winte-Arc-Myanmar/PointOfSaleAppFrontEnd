/**
 * Role DTO <-> domain mappers.
 * Application layer.
 */

import type { Role } from "@/core/domain/entities/Role";
import type { RoleDto } from "@/core/application/dtos/RoleDto";

export function toRole(dto: RoleDto): Role {
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    parentId: dto.parentId ?? null,
    name: dto.name,
    isSystemDefault: Boolean(dto.isSystemDefault),
    ...(Array.isArray(dto.permissions) && {
      permissionIds: dto.permissions
        .map((rp) => rp.permission?.id ?? rp.permissionId)
        .filter((id): id is string => typeof id === "string"),
    }),
  };
}

