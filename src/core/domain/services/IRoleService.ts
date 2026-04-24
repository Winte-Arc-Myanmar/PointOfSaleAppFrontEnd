/**
 * Role service interface.
 * Domain layer.
 */

import type { Role } from "@/core/domain/entities/Role";
import type { CreateRoleDto } from "@/core/application/dtos/RoleDto";
import type { GetRolesParams } from "../repositories/IRoleRepository";

export interface IRoleService {
  getAll(params?: GetRolesParams): Promise<Role[]>;
  getById(id: string): Promise<Role>;
  create(data: CreateRoleDto): Promise<Role>;
  delete(id: string): Promise<void>;
  assignPermissions(roleId: string, permissionIds: string[]): Promise<void>;
}

