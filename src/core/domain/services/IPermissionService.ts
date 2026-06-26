/**
 * Permission service interface.
 * Domain layer.
 */

import type { Permission } from "@/core/domain/entities/Permission";
import type { PaginatedResult } from "../types/pagination";

export interface IPermissionService {
  getAll(): Promise<PaginatedResult<Permission>>;
}

