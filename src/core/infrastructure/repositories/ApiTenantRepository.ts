/**
 * Tenant repository - CRUD via external API.
 * Infrastructure layer.
 */

import type { ITenantRepository } from "@/core/domain/repositories/ITenantRepository";
import type { Tenant } from "@/core/domain/entities/Tenant";
import type { TenantDto } from "@/core/application/dtos/TenantDto";
import { toTenant } from "@/core/application/mappers/TenantMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { GetTenantsParams } from "@/core/domain/repositories/ITenantRepository";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiTenantRepository implements ITenantRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetTenantsParams): Promise<PaginatedResult<Tenant>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const res = await this.httpClient.get<unknown>(API_ENDPOINTS.TENANTS.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<TenantDto>(res, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toTenant(dto as TenantDto & { id: string }),
      (dto) => !!dto?.id,
    );
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
    const dto = await this.httpClient.post<TenantDto>(
      API_ENDPOINTS.TENANTS.LIST,
      data
    );
    if (!dto?.id) throw new Error("Create tenant response missing id");
    return toTenant(dto as TenantDto & { id: string });
  }

  async update(id: string, data: Omit<TenantDto, "id">): Promise<Tenant> {
    const dto = await this.httpClient.patch<TenantDto>(
      API_ENDPOINTS.TENANTS.BY_ID(id),
      data
    );
    return toTenant({ ...dto, id: dto?.id ?? id });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.TENANTS.BY_ID(id));
  }
}

