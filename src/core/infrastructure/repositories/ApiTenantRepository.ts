/**
 * Tenant repository - CRUD via external API.
 * Infrastructure layer.
 */

import type { ITenantRepository } from "@/core/domain/repositories/ITenantRepository";
import type { Tenant } from "@/core/domain/entities/Tenant";
import type { TenantDto } from "@/core/application/dtos/TenantDto";
import { toTenant } from "@/core/application/mappers/TenantMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiTenantRepository implements ITenantRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<Tenant[]> {
    const dtos = (await this.httpClient.get<TenantDto[]>(
      API_ENDPOINTS.TENANTS.LIST
    )) as TenantDto[];
    return dtos
      .filter((dto): dto is TenantDto & { id: string } => !!dto.id)
      .map(toTenant);
  }

  async getById(id: string): Promise<Tenant | null> {
    try {
      const dto = await this.httpClient.get<TenantDto>(
        API_ENDPOINTS.TENANTS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toTenant(dto as TenantDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<TenantDto, "id">): Promise<Tenant> {
    const dto = (await this.httpClient.post<TenantDto>(
      API_ENDPOINTS.TENANTS.LIST,
      data
    )) as TenantDto;
    if (!dto.id) throw new Error("Create tenant response missing id");
    return toTenant(dto as TenantDto & { id: string });
  }

  async update(id: string, data: Omit<TenantDto, "id">): Promise<Tenant> {
    const dto = (await this.httpClient.patch<TenantDto>(
      API_ENDPOINTS.TENANTS.BY_ID(id),
      data
    )) as TenantDto;
    return toTenant({ ...dto, id: dto.id ?? id });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.TENANTS.BY_ID(id));
  }
}
