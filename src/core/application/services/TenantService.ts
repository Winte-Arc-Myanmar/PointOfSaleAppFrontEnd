/**
 * Tenant service implementation.
 * Application layer - delegates to ITenantRepository.
 */

import type { ITenantService } from "@/core/domain/services/ITenantService";
import type {
  GetTenantsParams,
  ITenantRepository,
} from "@/core/domain/repositories/ITenantRepository";
import type { Tenant } from "@/core/domain/entities/Tenant";
import type { TenantDto } from "../dtos/TenantDto";

export class TenantService implements ITenantService {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async getAll(params?: GetTenantsParams): Promise<Tenant[]> {
    return this.tenantRepository.getAll(params);
  }

  async getById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.getById(id);
  }

  async create(data: Omit<TenantDto, "id">): Promise<Tenant> {
    return this.tenantRepository.create(data);
  }

  async update(id: string, data: Omit<TenantDto, "id">): Promise<Tenant> {
    return this.tenantRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.tenantRepository.delete(id);
  }
}
