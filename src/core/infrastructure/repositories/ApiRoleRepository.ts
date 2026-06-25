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
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { GetRolesParams } from "@/core/domain/repositories/IRoleRepository";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

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

function preprocessRolePayload(payload: unknown): unknown {
  if (isRoleDto(payload)) return { items: [payload] };
  return payload;
}

export class ApiRoleRepository implements IRoleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetRolesParams): Promise<PaginatedResult<Role>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const data = await this.httpClient.get<unknown>(API_ENDPOINTS.ROLES.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<RoleDto>(preprocessRolePayload(data), {
      page,
      limit,
    });
    return mapPaginatedResult(
      parsed,
      (dto) => toRole(dto as RoleDto & { id: string }),
      (dto) => !!dto?.id,
    );
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
