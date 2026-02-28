/**
 * Auth DTO <-> domain mappers.
 * Application layer.
 */

import type { AuthUser } from "@/core/domain/entities/User";
import type { UserType } from "@/core/domain/types/auth";
import type { LoginCredentials } from "@/core/domain/types/auth";
import type {
  SigninRequestDto,
  SigninResponseDto,
  SigninUserDto,
} from "../dtos/AuthDto";

/** Maps domain LoginCredentials to API request body (type as system_admin/user). */
export function toSigninRequestDto(credentials: LoginCredentials): SigninRequestDto {
  const type: "user" | "system_admin" =
    credentials.type === "systemAdmin" ? "system_admin" : "user";
  const body: SigninRequestDto = {
    email: credentials.email,
    password: credentials.password,
    type,
  };
  if (credentials.type === "user" && credentials.tenantId && credentials.branchId?.trim()) {
    body.tenantId = credentials.tenantId;
    body.branchId = credentials.branchId.trim();
  }
  return body;
}

function normalizeUserType(raw: string | undefined): UserType {
  return raw === "system_admin" ? "systemAdmin" : (raw as UserType) || "user";
}

export interface ToAuthUserFallbacks {
  email?: string;
  tenantId?: string;
  branchId?: string | null;
}

/**
 * Maps signin response DTO to domain AuthUser.
 * Returns null if there is no token in the response.
 */
export function toAuthUser(
  dto: SigninResponseDto,
  fallbacks?: ToAuthUserFallbacks
): AuthUser | null {
  const token = dto.access_token ?? dto.token ?? dto.accessToken;
  if (!token) return null;

  const user: SigninUserDto | undefined = dto.user;
  const rawType = (user?.type ?? "") as string;
  const type = normalizeUserType(rawType) as AuthUser["type"];

  return {
    id: user?.id,
    email: user?.email ?? fallbacks?.email ?? "",
    name: user?.fullName ?? user?.name ?? null,
    image: user?.image,
    accessToken: token,
    type,
    tenantId: user?.tenantId ?? fallbacks?.tenantId,
    branchId: user?.branchId ?? fallbacks?.branchId ?? null,
  };
}
