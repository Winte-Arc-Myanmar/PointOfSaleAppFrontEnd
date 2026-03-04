/**
 * Tenant service interface.
 * Domain layer - defines the contract for tenant operations.
 */

import type { Tenant } from "../entities/Tenant";
import type { TenantDto } from "@/core/application/dtos/TenantDto";

export interface ITenantService {
  getAll(): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant | null>;
  create(data: Omit<TenantDto, "id">): Promise<Tenant>;
  update(id: string, data: Omit<TenantDto, "id">): Promise<Tenant>;
  delete(id: string): Promise<void>;
}
