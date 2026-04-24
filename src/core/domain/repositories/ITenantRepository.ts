/**
 * Tenant repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Tenant } from "../entities/Tenant";
import type { TenantDto } from "@/core/application/dtos/TenantDto";

export interface GetTenantsParams {
  page?: number;
  limit?: number;
}

export interface ITenantRepository {
  getAll(params?: GetTenantsParams): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant | null>;
  create(data: Omit<TenantDto, "id">): Promise<Tenant>;
  update(id: string, data: Omit<TenantDto, "id">): Promise<Tenant>;
  delete(id: string): Promise<void>;
}
