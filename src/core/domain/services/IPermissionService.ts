/**
 * Permission service interface.
 * Domain layer.
 */

import type { Permission } from "@/core/domain/entities/Permission";

export interface IPermissionService {
  getAll(): Promise<Permission[]>;
}

