/**
 * Permission repository - permissions catalog via external API using HttpClient.
 * Infrastructure layer.
 */

import type { IPermissionRepository } from "@/core/domain/repositories/IPermissionRepository";
import type { Permission } from "@/core/domain/entities/Permission";
import type { PermissionDto } from "@/core/application/dtos/PermissionDto";
import { toPermission } from "@/core/application/mappers/PermissionMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

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

function preprocessPermissionPayload(payload: unknown): unknown {
  if (isPermissionDto(payload)) return { items: [payload] };
  return payload;
}

export class ApiPermissionRepository implements IPermissionRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<PaginatedResult<Permission>> {
    const page = 1;
    const limit = 1000;
    const data = await this.httpClient.get<unknown>(API_ENDPOINTS.PERMISSIONS.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<PermissionDto>(
      preprocessPermissionPayload(data),
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toPermission(dto as PermissionDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }
}
