/**
 * Tenant service interface.
 * Domain layer - defines the contract for tenant operations.
 */

import type { Tenant } from "../entities/Tenant";
import type { TenantDto } from "@/core/application/dtos/TenantDto";
import type { GetTenantsParams } from "../repositories/ITenantRepository";

export interface ITenantService {
  getAll(params?: GetTenantsParams): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant | null>;
  create(data: Omit<TenantDto, "id">): Promise<Tenant>;
  update(id: string, data: Omit<TenantDto, "id">): Promise<Tenant>;
  delete(id: string): Promise<void>;
}
