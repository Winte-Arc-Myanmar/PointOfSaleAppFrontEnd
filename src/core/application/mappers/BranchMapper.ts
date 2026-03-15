/**
 * Branch entity <-> DTO mappers.
 * Application layer.
 */

import type { Branch } from "@/core/domain/entities/Branch";
import type { BranchDto } from "../dtos/BranchDto";

/** Parse backend decimal format { s, e, d } where d is array e.g. [40, 7128000] -> 40.7128 */
function parseDecimal(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value !== "object" || value === null || !("d" in value)) {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  const obj = value as { s?: number; d?: number[] };
  const d = Array.isArray(obj.d) ? obj.d : [];
  const sign = obj.s === -1 ? -1 : 1;
  if (d.length === 0) return null;
  if (d.length === 1) return sign * d[0];
  const fractional = d[1] != null ? d[1] / Math.pow(10, String(d[1]).length) : 0;
  const n = sign * (d[0] + fractional);
  return Number.isNaN(n) ? null : n;
}

export function toBranch(dto: BranchDto & { id: string }): Branch {
  return {
    id: dto.id,
    name: dto.name ?? "",
    tenantId: dto.tenantId ?? "",
    branchCode: dto.branchCode ?? "",
    type: dto.type ?? "",
    address: dto.address ?? "",
    city: dto.city ?? "",
    state: dto.state ?? "",
    country: dto.country ?? "",
    zipCode: dto.zipCode ?? "",
    phone: dto.phone ?? "",
    email: dto.email ?? "",
    latitude: parseDecimal(dto.latitude),
    longitude: parseDecimal(dto.longitude),
    openingHours: dto.openingHours ?? null,
    status: dto.status ?? null,
    managerId: dto.managerId ?? null,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toBranchDto(branch: Partial<Branch>): BranchDto {
  return {
    ...(branch.id && { id: branch.id }),
    name: branch.name ?? "",
    tenantId: branch.tenantId ?? "",
    branchCode: branch.branchCode ?? "",
    type: branch.type ?? "",
    address: branch.address ?? "",
    city: branch.city ?? "",
    state: branch.state ?? "",
    country: branch.country ?? "",
    zipCode: branch.zipCode ?? "",
    phone: branch.phone ?? "",
    email: branch.email ?? "",
    latitude: branch.latitude ?? undefined,
    longitude: branch.longitude ?? undefined,
    openingHours: branch.openingHours ?? undefined,
  };
}
