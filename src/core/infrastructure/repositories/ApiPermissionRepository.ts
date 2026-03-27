/**
 * Permission repository - permissions catalog via external API using HttpClient.
 * Infrastructure layer.
 */

import type { IPermissionRepository } from "@/core/domain/repositories/IPermissionRepository";
import type { Permission } from "@/core/domain/entities/Permission";
import type { PermissionDto } from "@/core/application/dtos/PermissionDto";
import { toPermission } from "@/core/application/mappers/PermissionMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function isPermissionDto(value: unknown): value is PermissionDto {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return (
    typeof rec.id === "string" &&
    typeof rec.module === "string" &&
    typeof rec.subject === "string" &&
    typeof rec.action === "string" &&
    typeof rec.description === "string"
  );
}

function normalizePermissionList(payload: unknown): PermissionDto[] {
  if (Array.isArray(payload)) return payload as PermissionDto[];
  if (payload && typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    if (Array.isArray(rec.items)) return rec.items as PermissionDto[];
    if (isPermissionDto(rec)) return [rec];
  }
  return [];
}

export class ApiPermissionRepository implements IPermissionRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<Permission[]> {
    const data = await this.httpClient.get<unknown>(API_ENDPOINTS.PERMISSIONS.LIST);
    return normalizePermissionList(data).map(toPermission);
  }
}

