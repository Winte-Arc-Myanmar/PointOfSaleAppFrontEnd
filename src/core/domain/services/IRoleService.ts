/**
 * Role service interface.
 * Domain layer.
 */

import type { Role } from "@/core/domain/entities/Role";
import type { CreateRoleDto } from "@/core/application/dtos/RoleDto";

export interface IRoleService {
  getAll(): Promise<Role[]>;
  getById(id: string): Promise<Role>;
  create(data: CreateRoleDto): Promise<Role>;
  delete(id: string): Promise<void>;
  assignPermissions(roleId: string, permissionIds: string[]): Promise<void>;
}

