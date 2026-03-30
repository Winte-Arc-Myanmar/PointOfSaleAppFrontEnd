/**
 * Permission service implementation.
 * Application layer - delegates to IPermissionRepository.
 */

import type { IPermissionService } from "@/core/domain/services/IPermissionService";
import type { IPermissionRepository } from "@/core/domain/repositories/IPermissionRepository";
import type { Permission } from "@/core/domain/entities/Permission";

export class PermissionService implements IPermissionService {
  constructor(private readonly repo: IPermissionRepository) {}

  getAll(): Promise<Permission[]> {
    return this.repo.getAll();
  }
}

