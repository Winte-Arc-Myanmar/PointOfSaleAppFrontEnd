/**
 * Permission repository interface.
 * Domain layer - permission catalog data access via backend.
 */

import type { Permission } from "@/core/domain/entities/Permission";
import type { PaginatedResult } from "../types/pagination";

export interface IPermissionRepository {
  getAll(): Promise<PaginatedResult<Permission>>;
}

