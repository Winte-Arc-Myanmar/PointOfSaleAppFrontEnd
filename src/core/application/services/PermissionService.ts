/**
 * Permission service implementation.
 * Application layer - delegates to IPermissionRepository.
 */

import type { IPermissionService } from "@/core/domain/services/IPermissionService";
import type { IPermissionRepository } from "@/core/domain/repositories/IPermissionRepository";
import type { Permission } from "@/core/domain/entities/Permission";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class PermissionService implements IPermissionService {
  constructor(private readonly repo: IPermissionRepository) {}

  getAll(): Promise<PaginatedResult<Permission>> {
    return this.repo.getAll();
  }
}

