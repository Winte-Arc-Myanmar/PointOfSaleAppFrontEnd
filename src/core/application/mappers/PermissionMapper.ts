/**
 * Permission DTO <-> domain mappers.
 * Application layer.
 */

import type { Permission } from "@/core/domain/entities/Permission";
import type { PermissionDto } from "@/core/application/dtos/PermissionDto";

export function toPermission(dto: PermissionDto): Permission {
  return {
    id: dto.id,
    module: dto.module,
    subject: dto.subject,
    action: dto.action,
    description: dto.description,
  };
}

