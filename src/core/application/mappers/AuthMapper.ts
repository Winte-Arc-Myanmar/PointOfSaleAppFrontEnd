/**
 * Auth DTO <-> domain mappers.
 * Application layer.
 */

import type { AuthUser } from "@/core/domain/entities/User";
import type { UserType, BranchAccess } from "@/core/domain/types/auth";
import type { LoginCredentials } from "@/core/domain/types/auth";
import type {
  SigninRequestDto,
  SigninResponseDto,
  SigninUserDto,
  BranchAccessDto,
} from "../dtos/AuthDto";

/** Maps domain LoginCredentials to API request body. */
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
  if (raw === "system_admin" || raw === "systemAdmin") return "systemAdmin";
  return "user";
}

function toBranchAccess(dto: BranchAccessDto): BranchAccess {
  return {
    branchId: dto.branchId,
    roles: Array.isArray(dto.roles) ? dto.roles : [],
    permissions: Array.isArray(dto.permissions) ? dto.permissions : [],
  };
}

export interface ToAuthUserFallbacks {
  email?: string;
  tenantId?: string;
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
  const type = normalizeUserType(user?.type);

  const access: BranchAccess[] = Array.isArray(dto.access)
    ? dto.access.map(toBranchAccess)
    : [];

  return {
    id: user?.id,
    email: user?.email ?? fallbacks?.email ?? "",
    name: user?.fullName ?? user?.name ?? null,
    image: user?.image,
    accessToken: token,
    type,
    tenantId: user?.tenantId ?? fallbacks?.tenantId,
    activeBranch: dto.activeBranch,
    access,
  };
}
