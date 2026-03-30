/**
 * Permission repository interface.
 * Domain layer - permission catalog data access via backend.
 */

import type { Permission } from "@/core/domain/entities/Permission";

export interface IPermissionRepository {
  getAll(): Promise<Permission[]>;
}

