/**
 * Adapts NextAuth credentials (framework shape) to domain LoginCredentials.
 * Server/infrastructure layer - part of the NextAuth adapter boundary.
 * Trims strings and treats empty / "undefined" as missing.
 */

import type { UserType } from "@/core/domain/types/auth";
import type { LoginCredentials } from "@/core/domain/types/auth";

export interface RawLoginCredentials {
  email?: unknown;
  password?: unknown;
  type?: unknown;
  tenantId?: unknown;
  branchId?: unknown;
}

function trimOptional(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).replace(/^["']|["']$/g, "").trim();
  if (s === "" || s === "undefined") return undefined;
  return s;
}

/**
 * Converts raw NextAuth credentials into domain LoginCredentials, or null if invalid.
 */
export function normalizeLoginCredentials(
  raw: RawLoginCredentials | null | undefined
): LoginCredentials | null {
  if (!raw) return null;

  const email = raw.email != null ? String(raw.email).trim() : "";
  const password = raw.password != null ? String(raw.password) : "";
  if (!email || !password) return null;

  const typeRaw = raw.type != null ? String(raw.type).trim() : "";
  let type: UserType;
  if (typeRaw === "system_admin" || typeRaw === "systemAdmin") type = "systemAdmin";
  else if (typeRaw === "user") type = "user";
  else return null;

  const tenantId = trimOptional(raw.tenantId);
  const branchIdRaw = trimOptional(raw.branchId);
  const branchId =
    type === "user" && branchIdRaw ? branchIdRaw : undefined;

  return {
    email,
    password,
    type,
    ...(tenantId && { tenantId }),
    ...(branchId && { branchId }),
  };
}
