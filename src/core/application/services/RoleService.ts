/**
 * Role service implementation.
 * Application layer - delegates to IRoleRepository.
 */

import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IRoleRepository } from "@/core/domain/repositories/IRoleRepository";
import type { Role } from "@/core/domain/entities/Role";
import type { CreateRoleDto } from "@/core/application/dtos/RoleDto";

export class RoleService implements IRoleService {
  constructor(private readonly repo: IRoleRepository) {}

  getAll(): Promise<Role[]> {
    return this.repo.getAll();
  }

  getById(id: string): Promise<Role> {
    return this.repo.getById(id);
  }

  create(data: CreateRoleDto): Promise<Role> {
    return this.repo.create(data);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    return this.repo.assignPermissions(roleId, permissionIds);
  }
}

