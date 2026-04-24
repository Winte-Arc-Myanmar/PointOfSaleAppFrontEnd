/**
 * Role repository - roles via external API using HttpClient.
 * Infrastructure layer.
 */

import type { IRoleRepository } from "@/core/domain/repositories/IRoleRepository";
import type { Role } from "@/core/domain/entities/Role";
import type {
  RoleDto,
  CreateRoleDto,
  AssignRolePermissionsDto,
} from "@/core/application/dtos/RoleDto";
import { toRole } from "@/core/application/mappers/RoleMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function isRoleDto(value: unknown): value is RoleDto {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.id === "string" &&
    typeof rec.tenantId === "string" &&
    typeof rec.name === "string" &&
    "parentId" in rec
  );
}

function normalizeRoleList(payload: unknown): RoleDto[] {
  if (Array.isArray(payload)) return payload as RoleDto[];
  // Some backends return { items: [...] } or a single object; handle gracefully.
  if (payload && typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    if (Array.isArray(rec.items)) return rec.items as RoleDto[];
    if (isRoleDto(rec)) return [rec];
  }
  return [];
}

export class ApiRoleRepository implements IRoleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: { page?: number; limit?: number }): Promise<Role[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const data = await this.httpClient.get<unknown>(API_ENDPOINTS.ROLES.LIST, {
      params: query,
    });
    const all = normalizeRoleList(data);

    // Some backends ignore page/limit and always return the full list.
    // If that happens, slice locally so UI pagination doesn't become "infinite".
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = Math.max(0, (page - 1) * limit);
    const pageItems =
      params && Array.isArray(all) && all.length > limit
        ? all.slice(start, start + limit)
        : all;

    return pageItems.map(toRole);
  }

  async getById(id: string): Promise<Role> {
    const dto = await this.httpClient.get<RoleDto>(API_ENDPOINTS.ROLES.BY_ID(id));
    return toRole(dto);
  }

  async create(data: CreateRoleDto): Promise<Role> {
    const dto = await this.httpClient.post<RoleDto>(API_ENDPOINTS.ROLES.CREATE, data);
    return toRole(dto);
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const body: AssignRolePermissionsDto = { roleId, permissionIds };
    await this.httpClient.post(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(roleId), body);
  }
}


